DECLARE Score AS INTEGER
DECLARE Question AS STRING
DECLARE CorrectAnswer AS STRING
DECLARE UserAnswer AS STRING

SET Score TO 0

START

DISPLAY "Mini Game Page"

DISPLAY "My Task"
DISPLAY "Resources"
DISPLAY "Progress Report"
DISPLAY "Support Booking"
DISPLAY "Mini Game"
DISPLAY "Log Out"

IF My Task IS CLICKED THEN
    REDIRECT TO "My Task Page"
END IF

IF Resources IS CLICKED THEN
    REDIRECT TO "Resources Page"
END IF

IF Progress Report IS CLICKED THEN
    REDIRECT TO "Progress Report Page"
END IF

IF Support Booking IS CLICKED THEN
    REDIRECT TO "Support Booking Page"
END IF

IF Mini Game IS CLICKED THEN
    REDIRECT TO "Mini Game Page"
END IF

IF Log Out IS CLICKED THEN
    REDIRECT TO "Student Login Page"
END IF

FETCH Quiz_Questions FROM Firebase

IF Quiz_Questions IS EMPTY THEN
    DISPLAY "No quiz questions available"
    STOP
END IF

FOR EACH Question_Record IN Quiz_Questions

    DISPLAY "Score: " + Score

    SET Question TO Question_Record.Question
    SET CorrectAnswer TO Question_Record.CorrectAnswer

    DISPLAY Question

    DISPLAY "A. " + Question_Record.OptionA
    DISPLAY "B. " + Question_Record.OptionB
    DISPLAY "C. " + Question_Record.OptionC
    DISPLAY "D. " + Question_Record.OptionD

    INPUT UserAnswer

    IF UserAnswer = CorrectAnswer THEN
        DISPLAY "Correct Answer"
        ADD 1 TO Score
    ELSE
        DISPLAY "Incorrect Answer"
        DISPLAY "Correct Answer: " + CorrectAnswer
    END IF

    DISPLAY "Current Score: " + Score

END FOR

DISPLAY "Quiz Completed"
DISPLAY "Final Score: " + Score

SAVE Score TO Firebase

DISPLAY "Play Again"
DISPLAY "Exit"

IF Play Again IS CLICKED THEN
    RELOAD "Mini Game Page"
END IF

IF Exit IS CLICKED THEN
    REDIRECT TO "Dashboard Page"
END IF

END