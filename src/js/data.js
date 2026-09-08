// Data access layer backed by Firebase Auth + Firestore.
import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ---------- Auth ----------

function friendlyAuthError(error) {
  const map = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  };
  return map[error.code] || error.message || "Something went wrong. Please try again.";
}

export async function registerUser({ name, email, password, role }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await setDoc(doc(db, "users", credential.user.uid), {
      name,
      email,
      role,
      quizScore: 0,
      notifications: { email: true, reminders: true },
      privacy: { visibility: "Only me", activeStatus: false },
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Don't leave an orphaned Auth account with no profile doc behind —
    // that would block every future registration attempt for this email
    // with "email-already-in-use" even though signup never really finished.
    await deleteUser(credential.user).catch(() => {});
    throw err;
  }
  return credential.user;
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export function logoutUser() {
  return signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}

export function sendReset(email) {
  return sendPasswordResetEmail(auth, email);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// Gate a page behind login. Calls onReady(firebaseUser, profile) once both
// the auth state and the Firestore profile doc are available. If `role` is
// given, users of the wrong role are bounced to their own dashboard.
export function requireAuth(role, onReady) {
  return watchAuth(async (fbUser) => {
    if (!fbUser) {
      window.location.href = "login.html";
      return;
    }
    const profile = await getUserProfile(fbUser.uid);
    if (!profile) {
      window.location.href = "login.html";
      return;
    }
    if (role && profile.role !== role) {
      window.location.href = profile.role === "facilitator" ? "dashboard-facilitator.html" : "dashboard-learner.html";
      return;
    }
    onReady(fbUser, profile);
  });
}

export { friendlyAuthError };

// ---------- User profile ----------

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, patch) {
  await updateDoc(doc(db, "users", uid), patch);
}

// ---------- Tasks ----------

export async function getTasks(uid) {
  const q = query(collection(db, "tasks"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTaskById(id) {
  const snap = await getDoc(doc(db, "tasks", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addTask(uid, task) {
  await addDoc(collection(db, "tasks"), { uid, completed: false, createdAt: serverTimestamp(), ...task });
}

export async function updateTaskDoc(id, patch) {
  await updateDoc(doc(db, "tasks", id), patch);
}

export async function deleteTaskDoc(id) {
  await deleteDoc(doc(db, "tasks", id));
}

// ---------- Support bookings ----------

export async function getBookings(uid) {
  const q = query(collection(db, "bookings"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addBookingDoc(uid, booking) {
  await addDoc(collection(db, "bookings"), { uid, createdAt: serverTimestamp(), ...booking });
}

// ---------- Facilitator mock roster ----------
// Demo data shown on the facilitator dashboard's student overview table —
// not read from Firestore, matches the original wireframe numbers.

export const FACILITATOR_STATS = { totalStudents: 48, outstandingTasks: 63, completedTasks: 152, averageProgress: 72 };

export const FACILITATOR_STUDENTS = [
  { name: "John Radebe", class: "Grade 12A", completedTasks: 12, progress: 65, status: "On Track" },
  { name: "Natasha Ledwaba", class: "Grade 12B", completedTasks: 14, progress: 58, status: "Needs Attention" },
  { name: "Refilwe Mashego", class: "Grade 12C", completedTasks: 18, progress: 80, status: "On Track" },
  { name: "Hope Moshia", class: "Grade 12D", completedTasks: 10, progress: 45, status: "Needs Attention" },
  { name: "Taboa Mhlongo", class: "Grade 12A", completedTasks: 20, progress: 90, status: "On Track" },
];
