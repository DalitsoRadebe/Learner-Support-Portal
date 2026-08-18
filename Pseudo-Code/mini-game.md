START

DISPLAY "Mini Game Page"

DISPLAY "My Task"
DISPLAY "Resources"
DISPLAY "Progress Report"
DISPLAY "Support Booking"
DISPLAY "Mini Game"
DISPLAY "Log Out"

DISPLAY "Score"
DISPLAY "Quiz Question"
DISPLAY "Option A"
DISPLAY "Option B"
DISPLAY "Option C"
DISPLAY "Option D"

IF My Task is clicked THEN
REDIRECT TO "My Task Page"
END IF

IF Resources is clicked THEN
REDIRECT TO "Resources Page"
END IF

IF Progress Report is clicked THEN
REDIRECT TO "Progress Report Page"
END IF

IF Support Booking is clicked THEN
REDIRECT TO "Support Booking Page"
END IF

IF Mini Game is clicked THEN
REDIRECT TO "Mini Game Page"
END IF

IF Log Out is clicked THEN
REDIRECT TO "Student Login Page"
END IF

DISPLAY "Which method filters an array?"

DISPLAY "A. map()"
DISPLAY "B. filter()"
DISPLAY "C. pop()"
DISPLAY "D. push()"

INPUT Answer

IF Answer is "B" THEN
DISPLAY "Correct Answer"
ADD 1 TO Score
ELSE
DISPLAY "Incorrect Answer"
END IF

DISPLAY "Score"
DISPLAY Score

REPEAT
DISPLAY "Next Quiz Question"
DISPLAY "Option A"
DISPLAY "Option B"
DISPLAY "Option C"
DISPLAY "Option D"
INPUT Answer

IF Answer is correct THEN
DISPLAY "Correct Answer"
ADD 1 TO Score
ELSE
DISPLAY "Incorrect Answer"
END IF

DISPLAY "Score"
DISPLAY Score

UNTIL Mini Game is exited

END