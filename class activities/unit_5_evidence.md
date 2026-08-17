Part - 1 Hope Moshia

1 - Client side developement refers to the part of a program that operates on the users device, it executes in the users web browser

Reference:Mozilla Developer Network (MDN). (n.d.). Client-side web APIs. Available at: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs [Accessed 17 Aug. 2026].

2 - server side developement is the code that runs on a remote server rather than the users browser, the difference is on the client side it runs on the browser, on the server side it runs remote

reference: Mozilla Developer Network (MDN). (n.d.). Server-side website programming. Available at: https://developer.mozilla.org/en-US/docs/Learn/Server-side [Accessed 17 Aug. 2026].

3 - HTML provides the structure of the application pages.

    CSS controls the visual appearance

    JavaScript provides application logic on the client side.

    Firebase Authentication manages user identity and login functionality

    Firebase Realtime Database is a cloud-hosted NoSQL database that stores data as JSON and synchronizes updates across connected clients in real time

    The Firebase REST API allows applications to communicate with Firebase over HTTPS

Reference: Mozilla Developer Network (MDN). (n.d.). CSS: Cascading Style Sheets. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS [Accessed 17 Aug. 2026].


4 - No, Firebase is not the same thing as server-side JavaScript, because Server-side JavaScript refers to JavaScript running on a server environment such as Node.js, While Firebase is a Backend Service platform

Refernces: 
Node.js. (n.d.). About Node.js. Available at: https://nodejs.org/en/about [Accessed 17 Aug. 2026].
Google Firebase. (n.d.). Firebase Overview. Available at: https://firebase.google.com/products-build [Accessed 17 Aug. 2026].

5 - Client side                                   
    Displaying the task creation form
    Entering task details
    Validating fields before submission
    Handling button clicks
    Sending requests to Firebase

     Server side
    Verifying the user's authentication status
    Applying security rules
    Storing the task in Firebase Realtime Database
    Returning success or error responses
    Synchronizing changes with other connected users

Reference:

Google Firebase. (n.d.). Firebase Realtime Database. Available at: https://firebase.google.com/docs/database [Accessed 17 Aug. 2026].

6 - because client-side code can be viewed or modified and if authentication and security existed only in browser, code attackers could bypass login checks

References:

Google Firebase. (n.d.). Firebase Security Rules. Available at: https://firebase.google.com/docs/rules
OWASP Foundation. (n.d.). OWASP Top 10 Web Application Security Risks. Available at: https://owasp.org/www-project-top-ten/

7 - Supabase
    Supabase is an open-source Backend-as-a-Service built around PostgreSQL
    it offers the following:
    Authentication
    Database services
    Storage
    Real-time features
    APIs

    AWS Amplify 
    AWS Amplify is Amazon's backend platform that integrates with AWS services
    it offers the following:
    Cognito (Authentication)
    DynamoDB
    Lambda
    S3 Storage

Reference:

Amazon Web Services. (n.d.). AWS Amplify Documentation. Available at: https://docs.amplify.aws

8 - 3 Security risks that could occurs if seensitive are incorrectly placed in sclient-side
    -Exposure of secrets
    -authentication bypass
    -unauthorized database access
    -data manipulation

References:

OWASP Foundation. (n.d.). OWASP Top 10 Web Application Security Risks. Available at: https://owasp.org/www-project-top-ten/
Mozilla Developer Network (MDN). (n.d.). Web Security. Available at: https://developer.mozilla.org/en-US/docs/Web/Security

Part - 2 John Radebe

Feature                 |   classification   | Justificfation

Registration            |   Both             | The registration form is displayed and completed
                                                on the client side, while Firebase Authentication creates and stores the user account on the server

Login                   |    Both            | Users enter credentials in the browser
                                                but authentication is verified by Firebase Authentication on the server side
Form Validation         | Client side        |  JavaScript validates required fields, formats,
                                                and input values in the browser before data is submitted.
Displaying the dashboard| Client side        | HTML, CSS, and JavaScript render and display the
                                                dashboard interface in the user's browser.
Creating a learning task| Both               | The learner enters task information in the browser
                                                and the task data is then saved to the Firebase Realtime Database.
Retrieving tasks        | Both               | JavaScript requests task data, while Firebase
                                                retrieves the data from the database and sends it back to the client.
Updating a task         | Both               | The user edits task information in the browser, 
                                                and the updated data is stored in the cloud database

Deleting a task         | both               | The delete action is initiated from the client side
                                                but the database removes the record on the server side.
Calculating learner     |  Client side      | Progress calculations are typically performed 
progress                                       using JavaScript based on task data already 
                                               retrieved from the database     
Filtering/searching     |  Client side      | JavaScript can filter and search displayed task
tasks                                         data without needing additional database processing.

Storing learner data    | Server/Cloud      | Learner information is permanently stored in 
                          Service             Firebase Realtime Database, which runs in the cloud

Authentication          | Server/Cloud      | Firebase Authentication verifies identities,
                          Service             manages user accounts, and issues secure 
                                              authentication tokens.

Database security/      | Server/Cloud      | Security rules are enforced by Firebase on the
access rules              Service             backend and cannot be trusted if implemented
                                              only in client-side code.

Updating the DOM        | client side       | The Document Object Model (DOM) exists in the
                                                browser, and JavaScript updates page content and
                                                elements directly.

Displaying success/     | Client side       | JavaScript displays feedback messages to users
error messages                                based on the results of operations performed.

Reference:

Google Firebase. (n.d.). Firebase Realtime Database. Available at: https://firebase.google.com/docs/database[Accessed 17 August 2026]

Part - 3  Refilwe Sekgala

Learner
   ↓
Opens SkillsTrack in Browser
(HTML + CSS + JavaScript)
   ↓
Enters Login Details
   ↓
JavaScript sends Login Request
   ↓
Firebase Authentication verifies credentials
   ↓
Authentication Response returned
(Success or Failure)
   ↓
Dashboard Loads
   ↓
Learner Creates Learning Task
   ↓
JavaScript validates task data
   ↓
Firebase SDK / REST API sends request
   ↓
Firebase Security Rules verify permissions
   ↓
Firebase Realtime Database stores task
   ↓
Success Response + Updated Data returned
   ↓
JavaScript updates the DOM
   ↓
Task appears on dashboard
   ↓
Learner progress recalculated
   ↓
Success message displayed

reference:

Google Firebase. (n.d.). Firebase Realtime Database. Available at: https://firebase.google.com/docs/database[Accessed 17 August 2026].

Part - 4 Natasha Ledwaba

1 - What action does the user perform?
    The learner logs into SkillsTrack and completes the Create Learning Task form by entering details such as the task title, description, due date, and status

2 - What does JavaScript do in the browser?
    Captures the information entered by the learner, or Handles the button click event.

3 - What validation occurs?
    Required fields are completed, or The task title is not empty

4 - What information leaves the browser?
    User ID, or task Title, or task Description

5- Which Firebase service receives the request?
    Firebase Realtime Database receives the request to store the task before access is granted, Firebase Authentication confirms the user's identity and Firebase Security Rules verify permissions

6 - What does Firebase do with it?
    Verifies the user's authentication token, or checks database security rules.

7 - What response/data is returned?
    A success confirmation if the task was saved, or the unique task ID.

8 - How does JavaScript process the result?
    Receives the response from Firebase.
    Checks whether the operation succeeded or failed.
    Extracts the returned task information.
    Updates the task list in memory.
    Triggers interface updates.

9 - How is the interface updated?
    Adding the new task to the dashboard, or refreshing the task list.

10 - What should happen if the request fails?
    The task should not be added to the dashboard, or an error message should be displayed.