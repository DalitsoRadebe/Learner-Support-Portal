// Account passwords live in Firebase Authentication, so Firebase can email a
// real password-reset link. Everything else about a user (name, role,
// settings, tasks, picture) still lives in this browser via storage.js.
//
// This file is a module; storage.js must be loaded before it as a normal
// script so its helpers (findUser, getUsers, saveUsers, DB, ...) are available.

import { auth, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const WRONG_PASSWORD_CODES = ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"];

function friendlyAuthError(error) {
  const map = {
    "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Could not reach the server. Check your internet connection and try again.",
    "auth/operation-not-allowed": "Email and password sign-in is not switched on for this Firebase project.",
  };
  return map[error.code] || error.message || "Something went wrong. Please try again.";
}

// Saves changes to one user's record in this browser.
function patchLocalUser(email, patch) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

// Once Firebase holds the password, this browser no longer keeps a copy.
function markOnFirebase(email) {
  return patchLocalUser(email, { firebase: true, password: "" });
}

// An account made before Firebase was added: its password is still only in
// this browser.
function isBrowserOnly(user) {
  return Boolean(user && !user.firebase && user.password);
}

// Name and role are also copied to Firestore so the account can be opened in
// another browser. This is a bonus: if the Firestore rules block it, sign-up
// and login in this browser still work.
async function saveCloudProfile(uid, user) {
  try {
    await setDoc(doc(db, "users", uid), { name: user.name, email: user.email, role: user.role }, { merge: true });
  } catch (e) {
    console.warn("Profile was not copied to Firestore:", e.message);
  }
}

async function loadCloudProfile(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn("Profile could not be read from Firestore:", e.message);
    return null;
  }
}

export async function registerAccount({ name, email, password, role }) {
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "That email address looks invalid." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password should be at least 6 characters." };
  }
  if (findUser(email)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    return { ok: false, error: friendlyAuthError(error) };
  }

  const user = { name, email, role, settings: DEFAULT_SETTINGS, firebase: true, password: "" };
  saveUsers([...getUsers(), user]);
  await saveCloudProfile(credential.user.uid, user);

  localStorage.setItem(DB.SESSION, user.email);
  return { ok: true, user };
}

export async function loginAccount(email, password) {
  let local = findUser(email);
  let credential;

  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    // An older, browser-only account logging in with its correct password:
    // create its Firebase account now so reset emails work from here on.
    const canMove = WRONG_PASSWORD_CODES.includes(error.code) && isBrowserOnly(local) && local.password === password;
    if (!canMove) {
      return { ok: false, error: friendlyAuthError(error) };
    }
    try {
      credential = await createUserWithEmailAndPassword(auth, local.email, password);
      await saveCloudProfile(credential.user.uid, local);
    } catch (moveError) {
      return {
        ok: false,
        error: moveError.code === "auth/email-already-in-use"
          ? "Incorrect email or password."
          : friendlyAuthError(moveError),
      };
    }
  }

  if (local) {
    local = markOnFirebase(local.email);
  } else {
    // Correct password, but this browser has never seen the account.
    const profile = await loadCloudProfile(credential.user.uid);
    if (!profile || !profile.role) {
      return {
        ok: false,
        error: "This account was registered in a different browser. Please log in from that browser.",
      };
    }
    local = {
      name: profile.name || email,
      email: credential.user.email,
      role: profile.role,
      settings: DEFAULT_SETTINGS,
      firebase: true,
      password: "",
    };
    saveUsers([...getUsers(), local]);
  }

  localStorage.setItem(DB.SESSION, local.email);
  return { ok: true, user: local };
}

// Emails a password-reset link. Works for learners and facilitators alike.
export async function sendResetLink(email) {
  const local = findUser(email);

  // Firebase can only email accounts it knows about, so an older browser-only
  // account is given a Firebase account first.
  if (isBrowserOnly(local)) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, local.email, local.password);
      await saveCloudProfile(credential.user.uid, local);
      markOnFirebase(local.email);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        markOnFirebase(local.email);
      } else {
        return { ok: false, error: friendlyAuthError(error) };
      }
    }
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: friendlyAuthError(error) };
  }
}

export async function changePassword(email, currentPassword, newPassword) {
  const login = await loginAccount(email, currentPassword);
  if (!login.ok) {
    return {
      ok: false,
      error: login.error === "Incorrect email or password." ? "Current password is incorrect." : login.error,
    };
  }
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: friendlyAuthError(error) };
  }
}
