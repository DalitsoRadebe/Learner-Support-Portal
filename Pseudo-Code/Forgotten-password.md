START
DISPLAY "Forgotten Password Page"
INPUT Email
IF Email is empty THEN
DISPLAY "Email is required"
STOP
END IF
IF Email is registered THEN
DISPLAY "Email confirmed"
DISPLAY "Enter New Password"
INPUT New_Password
INPUT Retype_Password
IF New_Password is empty THEN
DISPLAY "Password is required"
STOP
END IF
IF Retype_Password is empty THEN
DISPLAY "Please retype your password"
STOP
END IF
IF New_Password != Retype_Password THEN
DISPLAY "Passwords do not match"
STOP
END IF
SAVE New_Password
DISPLAY "Password Reset Successful"
REDIRECT TO "Student Login Page"
ELSE
DISPLAY "Email is not registered"
STOP
END IF
END