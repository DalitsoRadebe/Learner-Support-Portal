START

DISPLAY "Add Task Page"

DISPLAY "Cancel"
DISPLAY "Save Task"
DISPLAY "Delete"


INPUT Task_Title
INPUT Category
INPUT Date

IF Task_Title is empty THEN
DISPLAY "Task title is required"
STOP
END IF

IF Category is empty THEN
DISPLAY "Category is required"
STOP
END IF

IF Date is empty THEN
DISPLAY "Date is required"
STOP
END IF

IF Delete IS CLICKED THEN

    IF Task_ID EXISTS THEN

        DISPLAY "Are you sure you want to delete this task?"
        DISPLAY "Yes, Delete"
        DISPLAY "Cancel"

        IF "Yes, Delete" IS CLICKED THEN

            DELETE Task WHERE Task_ID = Selected_Task_ID

            DISPLAY "Task deleted successfully"
            REDIRECT TO "Task Manager Page"

        ELSE

            DISPLAY "Task deletion cancelled"

        END IF

    ELSE

        DISPLAY "No task selected"

    END IF

END IF

IF Cancel is clicked THEN
REDIRECT TO "Task Manager Page"
END IF

IF Save Task is clicked THEN
SAVE Task_Title
SAVE Category
SAVE Date
DISPLAY "Task Saved Successfully"
REDIRECT TO "Task Manager Page"
END IF

END