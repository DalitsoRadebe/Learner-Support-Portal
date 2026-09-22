// Add Task JavaScript

import {
    requireAuth,
    getTaskById,
    addTask,
    updateTaskDoc,
    deleteTaskDoc
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("student", async function(fbUser, profile) {

    renderShell("tasks");

    const form = document.getElementById("task-form");
    const deleteButton = document.getElementById("delete-btn");

    const params = new URLSearchParams(
        window.location.search
    );

    const taskId = params.get("id");

    let editingTask = null;


    // ---------- Edit existing task ----------

    if (taskId) {

        editingTask = await getTaskById(taskId);

        if (
            !editingTask ||
            editingTask.uid !== fbUser.uid
        ) {

            alert("Task not found.");

            window.location.href =
                "tasks.html";

            return;
        }

        document.getElementById("form-title")
            .textContent = "EDIT TASK";

        document.getElementById("title")
            .value = editingTask.title || "";

        document.getElementById("category")
            .value = editingTask.category || "";

        document.getElementById("date")
            .value = editingTask.date || "";

    } else {

        // No task ID means this is a new task.
        // The delete button has nothing to delete.

        deleteButton.style.display = "none";
    }


    // ---------- Save task ----------

    form.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const title =
                document.getElementById("title")
                    .value
                    .trim();

            const category =
                document.getElementById("category")
                    .value;

            const date =
                document.getElementById("date")
                    .value;


            if (!title) {

                alert(
                    "Task title is required"
                );

                return;
            }


            if (!category) {

                alert(
                    "Category is required"
                );

                return;
            }


            if (!date) {

                alert(
                    "Date is required"
                );

                return;
            }


            try {

                if (editingTask) {

                    await updateTaskDoc(
                        editingTask.id,
                        {
                            title: title,
                            category: category,
                            date: date
                        }
                    );

                } else {

                    await addTask(
                        fbUser.uid,
                        {
                            title: title,
                            category: category,
                            date: date
                        }
                    );
                }


                alert(
                    "Task Saved Successfully"
                );

                window.location.href =
                    "tasks.html";

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to save task. Please try again."
                );
            }
        }
    );


    // ---------- Delete task ----------

    deleteButton.addEventListener(
        "click",
        async function() {

            if (!editingTask) {

                alert("No task selected");

                return;
            }


            const confirmDelete =
                confirm(
                    "Are you sure you want to delete this task?"
                );


            if (!confirmDelete) {

                return;
            }


            try {

                await deleteTaskDoc(
                    editingTask.id
                );

                alert(
                    "Task deleted successfully"
                );

                window.location.href =
                    "tasks.html";

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to delete task. Please try again."
                );
            }
        }
    );

});