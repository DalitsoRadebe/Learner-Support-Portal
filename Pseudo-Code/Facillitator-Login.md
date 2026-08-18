START
DISPLAY "Facilitator Login Page"
INPUT Email
INPUT Student_Password
IF Email is empty THEN
DISPLAY "Email is required"
STOP
END IF
IF Student_Password is empty THEN
DISPLAY "Password is required"
STOP
END IF
DISPLAY "Login"
DISPLAY "Forgotten Password"
DISPLAY "Register"
IF Login button is clicked THEN

IF Email and Student_Password are correct THEN
DISPLAY "Login Successful"
REDIRECT TO "Dashboard"
ELSE
DISPLAY "Incorrect email or password"
STOP
END IF
END IF
IF Forgotten Password is clicked THEN
REDIRECT TO "Reset Password Page"
END IF
IF Register button is clicked THEN
REDIRECT TO "Student Registration Page"
END IF
END

