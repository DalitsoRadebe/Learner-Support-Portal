START

DISPLAY "Search Task Page"

DISPLAY "Search Task"

INPUT Search_Task

IF Search_Task is empty THEN

DISPLAY "Please enter a task to search"

STOP

END IF

SEARCH Task WHERE Task_Title MATCHES Search_Task

IF Task is found THEN

DISPLAY "Task Found"
DISPLAY Task_Title
DISPLAY Category
DISPLAY Date

ELSE

DISPLAY "Task not found"

END IF

DISPLAY "Back"

IF Back is clicked THEN

REDIRECT TO "Task Manager Page"

END IF

END