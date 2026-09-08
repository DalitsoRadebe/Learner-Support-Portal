START

DISPLAY "Facilitator Dashboard page"

DISPLAY "Total Students"

DISPLAY "Outstanding Tasks"

DISPLAY "Completed Tasks"

DISPLAY "Average Progress"

DISPLAY "Student Overview"

DISPLAY "Search Students"

DISPLAY "Student Name"

DISPLAY "Class"

DISPLAY "Completed Tasks"

DISPLAY "Progress"

DISPLAY "Status"

DISPLAY "Dashboard"

DISPLAY "Resources"

DISPLAY "Progress Report"

DISPLAY "Support Booking"

DISPLAY "Mini Game"

DISPLAY "Profile"

DISPLAY "Logout"

IF Dashboard is clicked THEN

REDIRECT TO "Facilitator Dashboard Page"

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

IF Profile is clicked THEN

REDIRECT TO "Profile Page"

END IF

IF Logout is clicked THEN

REDIRECT TO "Login Page"

END IF

IF Search Students is used THEN

INPUT "Student Name"

DISPLAY "Matching Student Information"

END IF

END