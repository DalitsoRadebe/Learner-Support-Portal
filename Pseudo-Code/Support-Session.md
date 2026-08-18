DISPLAY "Support Booking Page"

DISPLAY "My Task"
DISPLAY "Resources"
DISPLAY "Progress Report"
DISPLAY "Support Booking"
DISPLAY "Mini Game"
DISPLAY "Log Out"
DISPLAY "Book Session"

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

IF Book Session is clicked THEN
DISPLAY "Book a Support Session"

INPUT Topic
INPUT Preferred_Date
INPUT Notes

IF Topic is empty THEN
DISPLAY "Topic is required"
STOP
END IF

IF Preferred_Date is empty THEN
DISPLAY "Preferred date is required"
STOP
END IF

SAVE Topic
SAVE Preferred_Date
SAVE Notes

DISPLAY "Support Session Booked Successfully"
END IF

END