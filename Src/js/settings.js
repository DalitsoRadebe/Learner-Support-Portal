// Settings JavaScript

import {
    requireAuth,
    updateUserProfile
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth(null, function(fbUser, profile) {

    renderShell("");


    document.getElementById("settings-username")
        .textContent = profile.name;


    document.getElementById("settings-role")
        .textContent =
            profile.role === "facilitator"
                ? "Facilitator"
                : "Learner";


    // Show saved message
    function flashSaved(messageText) {

        const message =
            document.getElementById(
                "save-message"
            );

        message.hidden = false;

        message.textContent =
            messageText;


        setTimeout(function() {

            message.hidden = true;

        }, 2500);

    }


    // Change Username
    document.getElementById("username-btn")
        .addEventListener(
            "click",
            async function() {

                const newUsername =
                    document.getElementById(
                        "new-username"
                    )
                    .value
                    .trim();


                if (!newUsername) {

                    alert(
                        "Username is required"
                    );

                    return;
                }


                try {

                    await updateUserProfile(
                        fbUser.uid,
                        {
                            name: newUsername
                        }
                    );


                    document.getElementById(
                        "settings-username"
                    ).textContent =
                        newUsername;


                    document.getElementById(
                        "new-username"
                    ).value = "";


                    flashSaved(
                        "Username Updated Successfully"
                    );

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to update username."
                    );

                }

            }
        );


    // Notification Settings
    document.getElementById("notification-btn")
        .addEventListener(
            "click",
            async function() {

                try {

                    await updateUserProfile(
                        fbUser.uid,
                        {
                            notifications: {
                                email: true,
                                reminders: true
                            }
                        }
                    );


                    flashSaved(
                        "Notification settings saved."
                    );

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to save notification settings."
                    );

                }

            }
        );


    // Privacy Settings
    document.getElementById("privacy-btn")
        .addEventListener(
            "click",
            async function() {

                try {

                    await updateUserProfile(
                        fbUser.uid,
                        {
                            privacy: {
                                visibility: "Only me",
                                activeStatus: false
                            }
                        }
                    );


                    flashSaved(
                        "Privacy settings saved."
                    );

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to save privacy settings."
                    );

                }

            }
        );

});