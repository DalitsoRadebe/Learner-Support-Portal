// Login JavaScript

import {
    loginUser,
    getUserProfile,
    friendlyAuthError
} from "./data.js";


document.getElementById("login-form")
    .addEventListener("submit", async function(e) {

        e.preventDefault();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;

        const errorEl =
            document.getElementById("error");


        // Clear previous message
        errorEl.textContent = "";


        // Check if email is empty
        if (!email) {
            errorEl.textContent =
                "Email is required";
            return;
        }


        // Check if password is empty
        if (!password) {
            errorEl.textContent =
                "Password is required";
            return;
        }


        try {

            // Login with Firebase
            const user =
                await loginUser(
                    email,
                    password
                );


            // Get user's profile and role
            const profile =
                await getUserProfile(
                    user.uid
                );


            if (!profile) {
                errorEl.textContent =
                    "User profile not found.";
                return;
            }


            // Login successful
            errorEl.textContent =
                "Login Successful";


            // Redirect according to role
            if (profile.role === "facilitator") {

                window.location.href =
                    "dashboard-facilitator.html";

            } else {

                window.location.href =
                    "dashboard-learner.html";

            }

        } catch (error) {

            console.error(error);

            errorEl.textContent =
                friendlyAuthError(error);

        }

    });