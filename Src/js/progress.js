// Progress Report JavaScript

import {
    requireAuth,
    getTasks,
    getBookings
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("student", async function(fbUser, profile) {

    renderShell("progress");


    function isOverdue(task) {

        if (task.completed) {
            return false;
        }

        const due = new Date(task.date);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        return due < today;
    }


    try {

        const tasks =
            await getTasks(fbUser.uid);

        const bookings =
            await getBookings(fbUser.uid);


        // Calculate progress

        const completed =
            tasks.filter(function(task) {
                return task.completed;
            }).length;


        const overdue =
            tasks.filter(function(task) {
                return isOverdue(task);
            }).length;


        const outstanding =
            tasks.length - completed;


        const progress =
            tasks.length
                ? Math.round(
                    (completed / tasks.length) * 100
                )
                : 0;


        // Display progress

        document.getElementById("progress-fill")
            .style.width = progress + "%";


        document.getElementById("stat-completed")
            .textContent = completed;


        document.getElementById("stat-outstanding")
            .textContent = outstanding;


        document.getElementById("stat-overdue")
            .textContent = overdue;


        // Recent activity

        const activity = [

            ...tasks
                .filter(function(task) {
                    return task.completed;
                })
                .map(function(task) {
                    return task.title +
                        " task completed";
                }),


            ...bookings.map(function() {
                return "Support session booked";
            }),


            ...tasks
                .filter(function(task) {
                    return isOverdue(task);
                })
                .map(function(task) {
                    return task.title +
                        " task outstanding";
                })

        ];


        const activityList =
            document.getElementById(
                "activity-list"
            );


        if (activity.length === 0) {

            activityList.innerHTML =
                "<li><span>No activity yet.</span></li>";

        } else {

            activityList.innerHTML =
                activity
                    .slice(0, 8)
                    .map(function(item) {
                        return `
                            <li>
                                <span>${item}</span>
                            </li>
                        `;
                    })
                    .join("");

        }

    } catch (error) {

        console.error(error);

        document.getElementById("activity-list")
            .innerHTML =
            "<li><span>Unable to load activity.</span></li>";

    }

});