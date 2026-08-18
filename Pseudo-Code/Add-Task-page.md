START

DISPLAY "Add Task Page"

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

DISPLAY "Cancel"
DISPLAY "Save Task"

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