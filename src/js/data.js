// SkillsTrack Data Access Layer
// Firebase Authentication + Firestore

import { auth, db } from "../../Firebase/firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// =========================================================
// AUTH
// =========================================================

function friendlyAuthError(error) {

    const map = {
        "auth/email-already-in-use":
            "An account with this email already exists.",

        "auth/invalid-email":
            "That email address looks invalid.",

        "auth/weak-password":
            "Password should be at least 6 characters.",

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/wrong-password":
            "Incorrect email or password.",

        "auth/user-not-found":
            "Incorrect email or password.",

        "auth/too-many-requests":
            "Too many attempts. Please wait a moment and try again."
    };

    return map[error.code] ||
        error.message ||
        "Something went wrong. Please try again.";
}


// =========================================================
// REGISTER USER
// =========================================================

import {
    createUserWithEmailAndPassword,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "../../Firebase/firebase.js";

export async function registerUser({
    name,
    email,
    password,
    role
}) {

    const credential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    try {

        await setDoc(
            doc(db, "users", credential.user.uid),
            {
                name: name,
                email: email,
                role: role,

                quizScore: 0,

                notifications: {
                    email: true,
                    reminders: true
                },

                privacy: {
                    visibility: "Only me",
                    activeStatus: false
                },

                createdAt: serverTimestamp()
            }
        );

    } catch (error) {

        // Remove the Auth account if the
        // Firestore profile could not be created.

        await deleteUser(credential.user)
            .catch(function() {});

        throw error;
    }

    return credential.user;
}


// =========================================================
// LOGIN
// =========================================================

export async function loginUser(
    email,
    password
) {

    const credential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    return credential.user;
}


// =========================================================
// LOGOUT
// =========================================================

export function logoutUser() {

    return signOut(auth).then(function() {

        window.location.href = "login.html";

    });
}


// =========================================================
// PASSWORD RESET EMAIL
// =========================================================

export function sendReset(email) {

    return sendPasswordResetEmail(
        auth,
        email
    );
}


// =========================================================
// WATCH AUTHENTICATION
// =========================================================

export function watchAuth(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );
}


// =========================================================
// CHANGE PASSWORD
// =========================================================

export async function changePassword(
    currentPassword,
    newPassword
) {

    const user = auth.currentUser;

    if (!user) {
        throw new Error(
            "No user is currently logged in."
        );
    }

    const credential =
        EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

    await reauthenticateWithCredential(
        user,
        credential
    );

    await updatePassword(
        user,
        newPassword
    );
}


// =========================================================
// REQUIRE AUTHENTICATION
// =========================================================

export function requireAuth(
    role,
    onReady
) {

    return watchAuth(
        async function(fbUser) {

            if (!fbUser) {

                window.location.href =
                    "login.html";

                return;
            }

            const profile =
                await getUserProfile(
                    fbUser.uid
                );

            if (!profile) {

                window.location.href =
                    "login.html";

                return;
            }

            if (
                role &&
                profile.role !== role
            ) {

                if (
                    profile.role ===
                    "facilitator"
                ) {

                    window.location.href =
                        "dashboard-facilitator.html";

                } else {

                    window.location.href =
                        "dashboard-learner.html";
                }

                return;
            }

            onReady(
                fbUser,
                profile
            );
        }
    );
}

export {
    friendlyAuthError
};


// =========================================================
// USER PROFILE
// =========================================================

export async function getUserProfile(uid) {

    const snap =
        await getDoc(
            doc(db, "users", uid)
        );

    if (!snap.exists()) {
        return null;
    }

    return snap.data();
}


export async function updateUserProfile(
    uid,
    patch
) {

    await updateDoc(
        doc(db, "users", uid),
        patch
    );
}


// =========================================================
// TASKS
// =========================================================

export async function getTasks(uid) {

    const q =
        query(
            collection(db, "tasks"),
            where("uid", "==", uid)
        );

    const snap =
        await getDocs(q);

    return snap.docs.map(
        function(document) {

            return {
                id: document.id,
                ...document.data()
            };

        }
    );
}


export async function getTaskById(id) {

    const snap =
        await getDoc(
            doc(db, "tasks", id)
        );

    if (!snap.exists()) {
        return null;
    }

    return {
        id: snap.id,
        ...snap.data()
    };
}


export async function addTask(
    uid,
    task
) {

    await addDoc(
        collection(db, "tasks"),
        {
            uid: uid,
            completed: false,
            createdAt: serverTimestamp(),
            ...task
        }
    );
}


export async function updateTaskDoc(
    id,
    patch
) {

    await updateDoc(
        doc(db, "tasks", id),
        patch
    );
}


export async function deleteTaskDoc(
    id
) {

    await deleteDoc(
        doc(db, "tasks", id)
    );
}


// =========================================================
// SUPPORT BOOKINGS
// =========================================================

export async function getBookings(uid) {

    const q =
        query(
            collection(db, "bookings"),
            where("uid", "==", uid)
        );

    const snap =
        await getDocs(q);

    return snap.docs.map(
        function(document) {

            return {
                id: document.id,
                ...document.data()
            };

        }
    );
}


export async function addBookingDoc(
    uid,
    booking
) {

    await addDoc(
        collection(db, "bookings"),
        {
            uid: uid,
            createdAt: serverTimestamp(),
            ...booking
        }
    );
}


// =========================================================
// FACILITATOR DEMO DATA
// =========================================================

export const FACILITATOR_STATS = {

    totalStudents: 48,

    outstandingTasks: 63,

    completedTasks: 152,

    averageProgress: 72

};


export const FACILITATOR_STUDENTS = [

    {
        name: "John Radebe",
        class: "Grade 12A",
        completedTasks: 12,
        progress: 65,
        status: "On Track"
    },

    {
        name: "Natasha Ledwaba",
        class: "Grade 12B",
        completedTasks: 14,
        progress: 58,
        status: "Needs Attention"
    },

    {
        name: "Refilwe Mashego",
        class: "Grade 12C",
        completedTasks: 18,
        progress: 80,
        status: "On Track"
    },

    {
        name: "Hope Moshia",
        class: "Grade 12D",
        completedTasks: 10,
        progress: 45,
        status: "Needs Attention"
    },

    {
        name: "Taboa Mhlongo",
        class: "Grade 12A",
        completedTasks: 20,
        progress: 90,
        status: "On Track"
    }

];