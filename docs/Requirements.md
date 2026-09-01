1. Understand the Project Problem
Our team must first understand what problem the application is solving.
The project is to build a SkillsTrack Learner Support Portal. The portal should eventually help us learners to:
•	• Register and sign in
•	• Manage learning tasks
•	• Book support sessions
•	• View learning progress
•	• Use learning resources
•	• Play a coding mini-game
•	• Print a progress summary
The application uses JavaScript for the application logic and Firebase for data storage.
2. Create a Problem Statement
We need to write a clear explanation of:
The current problem
For example:
Learners currently manage their learning tasks, goals and support requests in different documents and messages. This makes it difficult for learners to track their work and for assessors to identify learners who need support.
The proposed solution
Our team will create a browser-based Learner Support Portal where users can manage tasks, track progress and request support from one central application.
We should also explain:
•	• Who the users are
•	• What problem they experience
•	• What our system will solve
•	• The boundaries of your project
3. Define the Project Scope
We must clearly state what is included in the project and what is not included.
Example of features included:
•	• User registration
•	• Login and logout
•	• Task management
•	• Progress calculation
•	• Support booking
•	• Search and filtering
•	• User preferences
•	• Printable summary
•	• Mini-game
The project requires minimum features such as authentication, a dashboard, task CRUD, support booking, search/filter/sort, cookies, confirmation dialogs, redirects, printing, animation, multimedia and a mini-game.
4. Write at Least Six User Stories
We need at least six user stories with acceptance criteria.
A user story normally follows this format:
As a [user], I want to [action] so that [benefit].
User Story 1: Registration
As a learner, I want to create an account so that I can access the Learner Support Portal.
Acceptance Criteria:
•	• The learner can enter a name.
•	• The learner can enter a valid email.
•	• The learner can create a password.
•	• Invalid information displays an error.
•	• Successful registration provides feedback.
User Story 2: Login
As a learner, I want to log into my account so that I can access my personal learning information.
User Story 3: Task Management
As a learner, I want to add, edit, complete and delete tasks so that I can manage my learning activities.
User Story 4: Progress
As a learner, I want to see my completed and outstanding tasks so that I can monitor my progress.
User Story 5: Support Booking
As a learner, I want to book a support session so that I can receive help when needed.
User Story 6: Preferences
As a learner, I want to save my display preference so that the portal remembers my preferred settings.
5. Create a Programming Life-Cycle Plan
You must show how our team will follow the programming life cycle.
We need to include:
1. Analysis
2. Design
3. Coding
4. Testing
5. Implementation
6. Review
7. Improvement
Our plan should also include milestones, testing activities and improvements.
6. Create Flowcharts or Pseudocode
We must create flowcharts or pseudocode for at least these four processes:
1. Login
Show the process of:
•	• User enters email and password
•	• Validate input
•	• Check credentials
•	• Allow access or display an error
2. Task Creation
Show:
•	• User enters task details
•	• Validate details
•	• Create task
•	• Save/display task
•	• Show feedback
3. Progress Calculation
Show how the application calculates:
•	• Total tasks
•	• Completed tasks
•	• Outstanding tasks
•	• Progress percentage
4. Deletion Confirmation
Show:
•	• User selects delete
•	• Confirmation dialog appears
•	• User selects Yes or No
•	• Task is deleted only after confirmation
7. Plan Your Firebase Database
Before coding, our team must design the Firebase data structure.
Users
users/{uid}
Possible information:
•	• displayName
•	• email
•	• role
•	• createdAt
Tasks
tasks/{taskId}
Possible information:
•	• userId
•	• title
•	• category
•	• dueDate
•	• priority
•	• completed
•	• createdAt
Support Bookings
bookings/{bookingId}
Possible information:
•	• userId
•	• topic
•	• preferredDate
•	• notes
•	• status
Game Scores
scores/{scoreId}
Possible information:
•	• userId
•	• score
•	• duration
•	• completedAt
Our team may adapt the structure with assessor approval.
8. Create a REST API Plan
We must plan how we will use REST operations with Firebase.
Operation – Purpose
GET – Retrieve data
POST – Create new data
PUT/PATCH – Update existing data
DELETE – Remove data
For example:
•	• POST → Create a new task
•	• GET → Get all learner tasks
•	• PATCH → Mark a task as completed
•	• DELETE → Delete a task
9. Plan Your Classes or Objects
We must show at least two planned classes and their relationship.
Example:
Task Class
Possible properties:
•	• title
•	• category
•	• dueDate
•	• completed
Possible methods:
•	• markComplete()
•	• updateTask()
User Class
Possible properties:
•	• name
•	• email
•	• role
Possible methods:
•	• login()
•	• logout()
We must also explain how the objects or classes are related.
10. Configure Your Development Environment
We must set up our development environment properly.
We need:
•	• Visual Studio Code or an approved IDE
•	• Code formatter
•	• Linter
•	• Debugging tools
•	• Selected JavaScript framework/library
The project requires HTML5, CSS3 and JavaScript ES6 or later, together with Firebase Realtime Database and appropriate development tools.
11. Set Up GitHub Properly
Our team needs:
•	• A shared GitHub repository
•	• A README file
•	• A .gitignore file
•	• Issues or project tasks
•	• Feature branches
•	• Pull requests
•	• Peer review evidence
•	• Merges
•	• Basic continuous integration
The project also requires each learner to make meaningful commits and explain their own contribution.
12. Create a Basic Application Shell
By the end of Month 1, we need a working application foundation.
Our application should have:
•	• Basic navigation
•	• Page structure
•	• Dynamic content
•	• A working interface shell
•	• JavaScript interaction
We do not necessarily need every final feature completed in Month 1, but we must have a functional foundation for the application
