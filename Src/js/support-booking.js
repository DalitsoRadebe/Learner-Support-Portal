// Support Booking JavaScript

import {
    requireAuth,
    addBookingDoc
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("student", function(fbUser, profile) {

    renderShell("support");


    const form =
        document.getElementById("support-form");


    form.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();


            const topic =
                document.getElementById("topic")
                    .value
                    .trim();

            const preferredDate =
                document.getElementById("preferred-date")
                    .value;

            const notes =
                document.getElementById("notes")
                    .value
                    .trim();


            const topicError =
                document.getElementById("topic-error");

            const dateError =
                document.getElementById("date-error");

            const successMessage =
                document.getElementById("success-message");


            topicError.textContent = "";
            dateError.textContent = "";
            successMessage.hidden = true;


            if (!topic) {

                topicError.textContent =
                    "Topic is required";

                return;
            }


            if (!preferredDate) {

                dateError.textContent =
                    "Preferred date is required";

                return;
            }


            try {

                await addBookingDoc(
                    fbUser.uid,
                    {
                        topic: topic,
                        date: preferredDate,
                        notes: notes
                    }
                );


                successMessage.textContent =
                    "Support Session Booked Successfully";

                successMessage.hidden = false;

                form.reset();


            } catch (error) {

                console.error(error);

                successMessage.textContent =
                    "Unable to book support session. Please try again.";

                successMessage.hidden = false;

            }

        }
    );

});