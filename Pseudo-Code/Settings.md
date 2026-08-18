START

DISPLAY "Settings Page"

DISPLAY "Change Username"
DISPLAY "Change Password"
DISPLAY "Notification Settings"
DISPLAY "Privacy Settings"

IF Change Username is clicked THEN
INPUT New_Username
SAVE New_Username
DISPLAY "Username Updated Successfully"
END IF

IF Change Password is clicked THEN
REDIRECT TO "Reset Password Page"
END IF

IF Notification Settings is clicked THEN
REDIRECT TO "Notification Settings Page"
END IF

IF Privacy Settings is clicked THEN
REDIRECT TO "Privacy Settings Page"
END IF

END