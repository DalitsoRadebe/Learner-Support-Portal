// Assessor Dashboard JavaScript

import {
    requireAuth,
    FACILITATOR_STATS,
    FACILITATOR_STUDENTS
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("facilitator", function(fbUser, profile) {

    renderShell("dashboard");


    // ---------- Dashboard statistics ----------

    document.getElementById("stat-total").textContent =
        FACILITATOR_STATS.totalStudents;

    document.getElementById("stat-outstanding").textContent =
        FACILITATOR_STATS.outstandingTasks;

    document.getElementById("stat-completed").textContent =
        FACILITATOR_STATS.completedTasks;

    document.getElementById("stat-average").textContent =
        FACILITATOR_STATS.averageProgress + "%";


    // ---------- Determine status CSS class ----------

    function statusClass(status) {

        if (status === "On Track") {
            return "on-track";
        }

        return "needs-attention";
    }


    // ---------- Display students ----------

    function renderStudents(filter) {

        const term =
            (filter || "").toLowerCase();

        const rows =
            FACILITATOR_STUDENTS.filter(
                function(student) {

                    return (
                        student.name
                            .toLowerCase()
                            .includes(term)
                        ||
                        student.class
                            .toLowerCase()
                            .includes(term)
                    );

                }
            );


        const studentRows =
            document.getElementById(
                "student-rows"
            );


        if (rows.length === 0) {

            studentRows.innerHTML =
                '<tr><td colspan="5">No students match your search.</td></tr>';

            return;
        }


        studentRows.innerHTML =
            rows.map(function(student) {

                return `
                    <tr>

                        <td>${student.name}</td>

                        <td>${student.class}</td>

                        <td>${student.completedTasks}</td>

                        <td>${student.progress}%</td>

                        <td>
                            <span class="status-pill ${statusClass(student.status)}">
                                ${student.status}
                            </span>
                        </td>

                    </tr>
                `;

            }).join("");
    }


    // ---------- Display students when page loads ----------

    renderStudents("");


    // ---------- Search students ----------

    document.getElementById("search")
        .addEventListener(
            "input",
            function(event) {

                renderStudents(
                    event.target.value
                );

            }
        );

});