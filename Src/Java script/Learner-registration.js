// HTML IDS
// <form id="registrationForm">

//     <input type="text" id="fullName" placeholder="Full Name and Surname">

//     <input type="email" id="email" placeholder="Email">

//     <input type="password" id="studentPassword" placeholder="Password">

//     <input type="password" id="retypePassword" placeholder="Retype Password">

//     <button type="submit">Register</button>

//     <button type="button" id="facilitatorBtn">
//         Facilitator
//     </button>

// </form>

const registrationForm = document.getElementById("registrationForm");
const facilitatorBtn = document.getElementById("facilitatorBtn");

registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // INPUT
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const studentPassword = document.getElementById("studentPassword").value;
    const retypePassword = document.getElementById("retypePassword").value;

    // Validate Full Name
    if (fullName === "") {
        alert("Full name and surname is required");
        return;
    }

    // Validate Email
    if (email === "") {
        alert("Email is required");
        return;
    }

    // Validate Password
    if (studentPassword === "") {
        alert("Password is required");
        return;
    }

    // Validate Retype Password
    if (retypePassword === "") {
        alert("Please retype your password");
        return;
    }

    // Check passwords
    if (studentPassword !== retypePassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        // Create user using Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            studentPassword
        );

        const user = userCredential.user;

        // SAVE user information to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: fullName,
            email: email,
            role: "student",
            createdAt: serverTimestamp()
        });

        alert("Registration Successful");

        // REDIRECT TO Learner Login page
        window.location.href = "learner-login.html";

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});


// Facilitator button
facilitatorBtn.addEventListener("click", function () {
    window.location.href = "facilitator-registration.html";
});