// Profile JavaScript

import {
    requireAuth,
    logoutUser
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("student", function(fbUser, profile) {

    renderShell("");


    document.getElementById("profile-name").textContent =
        profile.name;

    document.getElementById("profile-email").textContent =
        profile.email;


    // Log out
    document.getElementById("logout-btn")
        .addEventListener("click", async function() {

            const confirmLogout = confirm(
                "Are you sure you want to log out?"
            );

            if (confirmLogout) {

                await logoutUser();

            }

        });

});