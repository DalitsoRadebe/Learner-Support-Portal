// Student Registration JavaScript

import {
    registerUser,
    friendlyAuthError
} from "./data.js";


document.getElementById("register-form")
    .addEventListener("submit", async function(e) {

        e.preventDefault();

        const name =
            document.getElementById("name")
                .value
                .trim();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;

        const confirm =
            document.getElementById("confirm")
                .value;

        const errorEl =
            document.getElementById("error");


        errorEl.textContent = "";


        if (!name) {
            errorEl.textContent =
                "Full name and surname is required";
            return;
        }

        if (!email) {
            errorEl.textContent =
                "Email is required";
            return;
        }

        if (!password) {
            errorEl.textContent =
                "Password is required";
            return;
        }

        if (!confirm) {
            errorEl.textContent =
                "Please retype your password";
            return;
        }

        if (password !== confirm) {
            errorEl.textContent =
                "Passwords do not match";
            return;
        }


        try {

            await registerUser({
                name: name,
                email: email,
                password: password,
                role: "student"
            });


            errorEl.textContent =
                "Registration Successful";


            setTimeout(function() {

                window.location.href =
                    "login.html";

            }, 1000);


        } catch (error) {

            console.error(error);

            errorEl.textContent =
                friendlyAuthError(error);

        }

    });