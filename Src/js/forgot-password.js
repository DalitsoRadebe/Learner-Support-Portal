// Forgot Password JavaScript

import {
    sendReset,
    friendlyAuthError
} from "./data.js";


const form =
    document.getElementById("forgot-form");

const emailInput =
    document.getElementById("email");

const message =
    document.getElementById("message");


// Check email and send reset email
form.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email =
        emailInput.value.trim();

    message.hidden = false;


    // Check if email is empty
    if (!email) {
        message.textContent =
            "Email is required";
        return;
    }


    try {

        await sendReset(email);

        message.textContent =
            "Password reset email sent. Check your email and follow the instructions.";

    } catch (error) {

        console.error(error);

        message.textContent =
            friendlyAuthError(error);

    }

});