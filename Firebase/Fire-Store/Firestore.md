users
│
├── userId
│   ├── username
│   ├── email
│   ├── role
│   └── createdAt (timestamp) (when was this created)

tasks
│
├── taskId
│   ├── userId
│   ├── title
│   ├── description
│   ├── status
│   ├── dueDate
│   └── createdAt (timestamp) (when was this created)

supportBookings
│
├── bookingId
│   ├── userId
│   ├── topic
│   ├── preferredDate
│   ├── notes
│   ├── status
│   └── createdAt (timestamp) (when was this created)

gameScores
│
├── scoreId
│   ├── userId
│   ├── gameId
│   ├── score
│   ├── correctAnswers
│   ├── totalQuestions
│   └── date

resources
│
├── resourceId
│   ├── title
│   ├── description
│   ├── type
│   └── url
