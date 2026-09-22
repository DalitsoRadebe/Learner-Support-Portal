// Task Manager JavaScript

import {
    requireAuth,
    getTasks,
    updateTaskDoc,
    deleteTaskDoc
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("student", async function(fbUser, profile) {

    renderShell("tasks");


    let allTasks = [];


    function formatDate(date) {

        const taskDate =
            new Date(date);


        if (isNaN(taskDate)) {
            return date;
        }


        return taskDate.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short"
            }
        );

    }


    function isOverdue(task) {

        if (task.completed) {
            return false;
        }


        const dueDate =
            new Date(task.date);

        const today =
            new Date();


        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);


        return dueDate < today;

    }


    function displayTasks() {

        const search =
            document.getElementById("search")
                .value
                .toLowerCase();


        const filter =
            document.getElementById("filter")
                .value;


        const sort =
            document.getElementById("sort")
                .value;


        let tasks =
            [...allTasks];


        if (search) {

            tasks =
                tasks.filter(function(task) {

                    return task.title
                        .toLowerCase()
                        .includes(search);

                });

        }


        if (filter === "pending") {

            tasks =
                tasks.filter(function(task) {

                    return (
                        !task.completed &&
                        !isOverdue(task)
                    );

                });

        }


        if (filter === "completed") {

            tasks =
                tasks.filter(function(task) {

                    return task.completed;

                });

        }


        if (filter === "overdue") {

            tasks =
                tasks.filter(function(task) {

                    return isOverdue(task);

                });

        }


        if (sort === "title") {

            tasks.sort(function(a, b) {

                return a.title.localeCompare(
                    b.title
                );

            });

        } else {

            tasks.sort(function(a, b) {

                return new Date(a.date) -
                    new Date(b.date);

            });

        }


        const taskRows =
            document.getElementById(
                "task-rows"
            );


        if (tasks.length === 0) {

            taskRows.innerHTML =
                '<tr><td colspan="3">No tasks found.</td></tr>';

            return;
        }


        taskRows.innerHTML =
            tasks.map(function(task) {

                let status = "";


                if (task.completed) {

                    status =
                        '<span class="status-pill on-track">Completed</span>';

                } else if (isOverdue(task)) {

                    status =
                        '<span class="status-pill overdue">Overdue</span>';

                }


                return `
                    <tr>

                        <td>
                            ${task.title} ${status}

                            <div class="row-actions">

                                <button
                                    data-action="complete"
                                    data-id="${task.id}">
                                    ${task.completed
                                        ? "Mark Incomplete"
                                        : "Complete"}
                                </button>

                                <a href="task-form.html?id=${task.id}">
                                    Edit
                                </a>

                                <button
                                    class="danger"
                                    data-action="delete"
                                    data-id="${task.id}">
                                    Delete
                                </button>

                            </div>
                        </td>

                        <td>
                            ${formatDate(task.date)}
                        </td>

                        <td></td>

                    </tr>
                `;

            }).join("");

    }


    async function loadTasks() {

        try {

            allTasks =
                await getTasks(
                    fbUser.uid
                );


            displayTasks();


        } catch (error) {

            console.error(error);

            document.getElementById(
                "task-rows"
            ).innerHTML =
                '<tr><td colspan="3">Unable to load tasks.</td></tr>';

        }

    }


    document.getElementById("task-rows")
        .addEventListener(
            "click",
            async function(event) {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {
                    return;
                }


                const taskId =
                    button.dataset.id;

                const action =
                    button.dataset.action;


                const task =
                    allTasks.find(
                        function(task) {
                            return task.id === taskId;
                        }
                    );


                if (!task) {
                    return;
                }


                if (action === "complete") {

                    try {

                        await updateTaskDoc(
                            taskId,
                            {
                                completed:
                                    !task.completed
                            }
                        );


                        await loadTasks();


                    } catch (error) {

                        console.error(error);

                        alert(
                            "Unable to update task."
                        );

                    }

                }


                if (action === "delete") {

                    if (
                        !confirm(
                            "Delete this task?"
                        )
                    ) {
                        return;
                    }


                    try {

                        await deleteTaskDoc(
                            taskId
                        );


                        await loadTasks();


                    } catch (error) {

                        console.error(error);

                        alert(
                            "Unable to delete task."
                        );

                    }

                }

            }
        );


    document.getElementById("search")
        .addEventListener(
            "input",
            displayTasks
        );


    document.getElementById("filter")
        .addEventListener(
            "change",
            displayTasks
        );


    document.getElementById("sort")
        .addEventListener(
            "change",
            displayTasks
        );


    await loadTasks();

});