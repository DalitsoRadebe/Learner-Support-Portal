START

DISPLAY "Student Profile Page"

DISPLAY "Profile Photo"
DISPLAY "Username"
DISPLAY "Settings"
DISPLAY "Log Out"

IF Settings is clicked THEN
REDIRECT TO "Settings Page"
END IF

IF Log Out is clicked THEN
DISPLAY "Are you sure you want to log out?"

IF Yes is clicked THEN
REDIRECT TO "Student Login Page"
END IF

END IF

END