// Student Dashboard JavaScript

import {
    requireAuth,
    getTasks
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("student", async function(fbUser, profile) {

    renderShell("dashboard");


    // Calculate the number of days between today and the task date
    function dayDiffFromToday(dateStr) {

        const due = new Date(dateStr);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        return Math.round(
            (due - today) / 86400000
        );

    }


    // Determine the status of a task
    function taskStatus(task) {

        if (task.completed) {

            return {
                label: "Completed",
                cls: "on-track"
            };

        }


        const diff =
            dayDiffFromToday(task.date);


        if (diff < 0) {

            return {
                label: "Overdue",
                cls: "overdue"
            };

        }


        if (diff <= 3) {

            return {
                label: "Due Soon",
                cls: "due-soon"
            };

        }


        return {
            label: "Pending",
            cls: "pending"
        };

    }


    try {

        // Get tasks from Firebase
        const tasks =
            await getTasks(fbUser.uid);


        const completed =
            tasks.filter(function(task) {
                return task.completed;
            }).length;


        const outstanding =
            tasks.length - completed;


        const progress =
            tasks.length
                ? Math.round(
                    (completed / tasks.length) * 100
                )
                : 0;


        // Display statistics

        document.getElementById(
            "stat-outstanding"
        ).textContent = outstanding;


        document.getElementById(
            "stat-completed"
        ).textContent = completed;


        document.getElementById(
            "stat-all"
        ).textContent = tasks.length;


        document.getElementById(
            "stat-progress"
        ).textContent =
            progress + "%";


        // Get the five most recent tasks
        const recent =
            [...tasks]
                .sort(function(a, b) {

                    return new Date(a.date) -
                        new Date(b.date);

                })
                .slice(0, 5);


        // Display recent tasks
        document.getElementById(
            "recent-list"
        ).innerHTML =

            recent.map(function(task) {

                const status =
                    taskStatus(task);


                return `
                    <li>

                        <span>
                            ${task.title}
                        </span>

                        <span class="status-pill ${status.cls}">
                            ${status.label}
                        </span>

                    </li>
                `;

            }).join("")

            ||

            '<li><span>No tasks yet — add one from My Tasks.</span></li>';


    } catch (error) {

        console.error(error);

        document.getElementById(
            "recent-list"
        ).innerHTML =
            '<li><span>Unable to load tasks.</span></li>';

    }

});