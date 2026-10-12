// Keeps the data in this browser (storage.js) in step with Cloud Firestore.
//
// The pages still read and write through storage.js, which is instant. This
// file does the two things that make Firestore the real home of the data:
//   1. Before a page runs, it replaces the browser's copy with what is in
//      Firestore, so the same account shows the same data on any device.
//   2. It gives storage.js a `window.cloud` object. storage.js calls it after
//      every change, and the change is written to Firestore.
//
// Every signed-in page's script starts with `import "./cloud.js"`. That import
// only finishes once step 1 is done. storage.js and shell.js must be loaded
// before it as normal scripts.
//
// Firestore layout:
//   users/{uid}     name, email, role, settings, photo, quizScore
//   tasks/{id}      uid (the learner), studentEmail, title, category, date,
//                   instructions, attachment, completed, assignedBy,
//                   assignedByName, assignedByUid (the facilitator),
//                   or sharedWith, sharedWithName, sharedWithUid when the
//                   learner added the task and shared it with a facilitator,
//                   submission { text, file, submittedAt },
//                   mark, feedback, markedAt
//   bookings/{id}   uid (the learner), topic, date, time, notes, createdAt,
//                   and bookedBy, bookedByName, bookedByUid when a
//                   facilitator made the booking, or bookedWith,
//                   bookedWithName, bookedWithUid when the learner booked
//                   it with a facilitator
//   resources/{id}  title, description, url or file, createdBy,
//                   createdByName, createdByUid (the facilitator), createdAt
//   files/{id}      ownerUid, readers (uids), name, type, size, data
//                   (the file itself; tasks only hold { fileId, name, ... }),
//                   and public: true for a resource anyone signed in can get

import { auth, db } from "./firebase-init.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// How long a page waits for Firestore before carrying on with the copy that
// is already in this browser.
const LOAD_TIMEOUT_MS = 8000;
const UPLOAD_TIMEOUT_MS = 30000;

function showError(text) {
  if (typeof flashMessage === "function") flashMessage(text, "error");
}

function explain(error) {
  return error && error.code === "permission-denied"
    ? "Firebase refused it. Check that the Firestore rules are published."
    : "Check your internet connection.";
}

// Writes are not usually awaited by the pages, so a failure is reported from
// here. The returned promise always resolves.
function send(what, promise) {
  return promise.catch((error) => {
    console.error(`Firestore: could not save ${what}`, error);
    showError(`Your ${what} could not be saved to Firebase. ${explain(error)}`);
  });
}

function myUid() {
  return auth.currentUser ? auth.currentUser.uid : null;
}

function taskDoc(email, task) {
  const owner = findUser(email);
  if (!owner || !owner.uid) return null;
  const { id, ...fields } = task;
  const data = { createdAt: new Date().toISOString(), ...fields, uid: owner.uid, studentEmail: owner.email };
  // A task written into someone else's list was assigned by a facilitator.
  if (owner.uid !== myUid()) data.assignedByUid = myUid();
  return data;
}

function bookingDoc(email, booking) {
  const owner = findUser(email);
  if (!owner || !owner.uid) return null;
  const { id, ...fields } = booking;
  const data = { ...fields, uid: owner.uid };
  if (owner.uid !== myUid()) data.bookedByUid = myUid();
  return data;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function timeout(ms) {
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error("timed out")), ms));
}

window.cloud = {
  saveProfile(patch) {
    if (!myUid()) return;
    send("profile", setDoc(doc(db, "users", myUid()), patch, { merge: true }));
  },

  saveTask(email, task) {
    if (!myUid()) return;
    const data = taskDoc(email, task);
    if (!data) {
      showError(`${email} has not signed in since the portal moved to Firebase, so this task is only saved in this browser.`);
      return;
    }
    return send("task", setDoc(doc(db, "tasks", task.id), data));
  },

  updateTask(id, patch) {
    if (!myUid()) return;
    send("task", updateDoc(doc(db, "tasks", id), patch));
  },

  deleteTask(id) {
    if (!myUid()) return;
    send("task", deleteDoc(doc(db, "tasks", id)));
  },

  saveBooking(email, booking) {
    if (!myUid()) return;
    const data = bookingDoc(email, booking);
    if (!data) {
      showError(`${email} has not signed in since the portal moved to Firebase, so this booking is only saved in this browser.`);
      return;
    }
    send("booking", setDoc(doc(db, "bookings", booking.id), data));
  },

  deleteBooking(id) {
    if (!myUid()) return;
    send("booking", deleteDoc(doc(db, "bookings", id)));
  },

  saveResource(resource) {
    if (!myUid()) return;
    const { id, ...fields } = resource;
    return send("resource", setDoc(doc(db, "resources", id), { ...fields, createdByUid: myUid() }));
  },

  deleteResource(id) {
    if (!myUid()) return;
    send("resource", deleteDoc(doc(db, "resources", id)));
  },

  // Stores a file so that the people in `readerUids` (and the uploader) can
  // download it, or anyone signed in when `isPublic` is true. Resolves with
  // the small record a task keeps about the file; rejects if the file did not
  // reach Firestore.
  async uploadFile(file, readerUids, isPublic = false) {
    const id = newId();
    const record = { fileId: id, name: file.name, type: file.type || "application/octet-stream", size: file.size };
    const data = await readAsDataUrl(file);
    await Promise.race([
      setDoc(doc(db, "files", id), {
        ownerUid: myUid(),
        readers: [...new Set([myUid(), ...readerUids.filter(Boolean)])],
        name: record.name,
        type: record.type,
        size: record.size,
        data,
        public: isPublic,
        createdAt: new Date().toISOString(),
      }),
      timeout(UPLOAD_TIMEOUT_MS),
    ]);
    return record;
  },

  async downloadFile(fileId) {
    const snap = await getDoc(doc(db, "files", fileId));
    if (!snap.exists()) throw new Error("file not found");
    const file = snap.data();
    const blob = await (await fetch(file.data)).blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  signOut() {
    return signOut(auth);
  },
};

// Any button made by fileButtonHtml() (shell.js) downloads its file.
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-file-id]");
  if (!btn) return;
  btn.disabled = true;
  try {
    await window.cloud.downloadFile(btn.dataset.fileId);
  } catch (error) {
    console.error("Firestore: could not download file", error);
    showError(`The file could not be downloaded. ${explain(error)}`);
  }
  btn.disabled = false;
});

// ---------- Loading from Firestore ----------

async function fetchWhere(name, field, value) {
  const snap = await getDocs(query(collection(db, name), where(field, "==", value)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Adds this record to the browser's user list, or updates the one already there.
function putLocalUser(record) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === record.email.toLowerCase());
  const merged = { ...(idx === -1 ? {} : users[idx]), ...record, firebase: true, password: "" };
  if (idx === -1) users.push(merged);
  else users[idx] = merged;
  saveUsers(users);
  return merged;
}

// Runs once per account: data that was saved in this browser before the
// portal used Firestore is uploaded, so nothing a user already had is lost.
// A document that is already in Firestore is left as it is.
async function uploadBrowserData(me, students) {
  const uploads = [];

  if (me.role === "student") {
    getTasks(me.email).forEach((t) => uploads.push(setDoc(doc(db, "tasks", t.id), taskDoc(me.email, t))));
    getBookings(me.email).forEach((b) => uploads.push(setDoc(doc(db, "bookings", b.id), bookingDoc(me.email, b))));
  } else {
    students.forEach((s) => getTasks(s.email)
      .filter((t) => t.assignedBy === me.email)
      .forEach((t) => uploads.push(setDoc(doc(db, "tasks", t.id), taskDoc(s.email, t)))));
  }

  const results = await Promise.allSettled(uploads);
  results.filter((r) => r.status === "rejected")
    .forEach((r) => console.warn("Firestore: an older item was not uploaded:", r.reason.message));

  const patch = { browserDataCopied: true };
  if (me.settings) patch.settings = me.settings;
  if (me.photo) patch.photo = me.photo;
  if (me.role === "student") patch.quizScore = getQuizScore(me.email);
  await setDoc(doc(db, "users", me.uid), patch, { merge: true });
  return patch;
}

async function loadLearner(me) {
  const [tasks, bookings, facilitators] = await Promise.all([
    fetchWhere("tasks", "uid", me.uid),
    fetchWhere("bookings", "uid", me.uid),
    fetchWhere("users", "role", "facilitator"),
  ]);
  writeJSON(DB.TASKS_PREFIX + me.email, tasks);
  writeJSON(DB.BOOKINGS_PREFIX + me.email, bookings);
  // So the learner can choose a facilitator to share a task with.
  facilitators.forEach((f) => putLocalUser({ uid: f.id, name: f.name, email: f.email, role: "facilitator" }));
  const uids = new Set(facilitators.map((f) => f.id));
  saveUsers(getUsers().filter((u) => u.role !== "facilitator" || uids.has(u.uid) || (!u.firebase && u.password)));
}

// A facilitator's browser holds every learner (to pick from) and the tasks
// this facilitator has sent them.
async function loadStudents() {
  const found = await fetchWhere("users", "role", "student");
  const students = found.map((s) => putLocalUser({ uid: s.id, name: s.name, email: s.email, role: "student" }));

  // Learners removed from Firestore are dropped here too. Accounts that have
  // not moved to Firebase yet are kept: their password is only in this browser.
  const uids = new Set(students.map((s) => s.uid));
  saveUsers(getUsers().filter((u) => u.role !== "student" || uids.has(u.uid) || (!u.firebase && u.password)));
  return students;
}

// Tasks this facilitator sent (with the learners' submissions), learners' own
// tasks shared with this facilitator, support sessions this facilitator
// booked for learners, and sessions learners booked with this facilitator.
async function loadAssignedWork(me, students) {
  const [sent, shared, booked, requested] = await Promise.all([
    fetchWhere("tasks", "assignedByUid", me.uid),
    fetchWhere("tasks", "sharedWithUid", me.uid),
    fetchWhere("bookings", "bookedByUid", me.uid),
    fetchWhere("bookings", "bookedWithUid", me.uid),
  ]);
  const tasks = [...sent, ...shared];
  const bookings = [...booked, ...requested];
  students.forEach((s) => {
    const otherTasks = getTasks(s.email).filter((t) => t.assignedBy !== me.email && t.sharedWith !== me.email);
    writeJSON(DB.TASKS_PREFIX + s.email, [...otherTasks, ...tasks.filter((t) => t.uid === s.uid)]);
    const otherBookings = getBookings(s.email).filter((b) => b.bookedBy !== me.email && b.bookedWith !== me.email);
    writeJSON(DB.BOOKINGS_PREFIX + s.email, [...otherBookings, ...bookings.filter((b) => b.uid === s.uid)]);
  });
}

async function loadFromFirestore(fbUser) {
  const ref = doc(db, "users", fbUser.uid);
  const local = findUser(fbUser.email);
  const snap = await getDoc(ref);
  let profile = snap.exists() ? snap.data() : null;

  if (!profile) {
    // The account exists but its profile never reached Firestore.
    if (!local) return;
    profile = { name: local.name, email: local.email, role: local.role, createdAt: new Date().toISOString() };
    await setDoc(ref, profile);
  }

  let me = putLocalUser({
    uid: fbUser.uid,
    name: profile.name,
    email: local ? local.email : profile.email || fbUser.email,
    role: profile.role,
  });
  localStorage.setItem(DB.SESSION, me.email);

  const students = me.role === "facilitator" ? await loadStudents() : [];

  if (!profile.browserDataCopied) {
    profile = { ...profile, ...await uploadBrowserData(me, students) };
  }
  me = putLocalUser({
    email: me.email,
    settings: profile.settings || DEFAULT_SETTINGS,
    photo: profile.photo || "",
  });

  if (me.role === "facilitator") {
    await loadAssignedWork(me, students);
  } else {
    await loadLearner(me);
    writeJSON(DB.QUIZ_PREFIX + me.email, profile.quizScore || 0);
  }
  await loadResources();
}

// A failure here leaves the resources from the last visit, and does not stop
// the rest of the page's data from loading.
async function loadResources() {
  try {
    const snap = await getDocs(collection(db, "resources"));
    writeJSON(DB.RESOURCES, snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    console.warn("Firestore: could not load resources.", error);
  }
}

await auth.authStateReady();

if (!auth.currentUser) {
  // Nobody is signed in to Firebase, so nothing could be saved. Ending the
  // browser session sends the page back to the login screen.
  localStorage.removeItem(DB.SESSION);
} else {
  try {
    await Promise.race([loadFromFirestore(auth.currentUser), timeout(LOAD_TIMEOUT_MS)]);
  } catch (error) {
    console.warn("Firestore: could not load, using the copy in this browser.", error);
    showError(`Could not load your data from Firebase, so this is the copy saved in this browser. ${explain(error)}`);
  }
}
