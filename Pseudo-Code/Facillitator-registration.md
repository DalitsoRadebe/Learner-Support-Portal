START

DISPLAY "Facillitator Registration Page"

INPUT Full_Name_And_Surname
INPUT Email
INPUT Facillitator_Password
INPUT Retype_Password

IF Full_Name_And_Surname is empty THEN
DISPLAY "Full name and surname is required"
STOP
END IF

IF Email is empty THEN
DISPLAY "Email is required"
STOP
END IF

IF Facillitator_Password is empty THEN
DISPLAY "Password is required"
STOP
END IF

IF Retype_Password is empty THEN
DISPLAY "Please retype your password"
STOP
END IF

IF Facillitator_Password != Retype_Password THEN
DISPLAY "Passwords do not match"
STOP
END IF

DISPLAY "Registration Successful"

SAVE Full_Name_And_Surname
SAVE Email
SAVE Retype_Password

END