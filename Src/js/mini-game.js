// Mini Game JavaScript

import {
    requireAuth,
    updateUserProfile
} from "./data.js";

import { renderShell } from "./shell.js";


requireAuth("student", async function(fbUser, profile) {

    renderShell("game");


    const QUESTIONS = [
        {
            question: "Which method filters an array?",
            optionA: "map()",
            optionB: "filter()",
            optionC: "reduce()",
            optionD: "loop()",
            correctAnswer: "B"
        },
        {
            question: "Which keyword declares a block-scoped variable?",
            optionA: "var",
            optionB: "let",
            optionC: "function",
            optionD: "static",
            correctAnswer: "B"
        },
        {
            question: "What does JSON.stringify() do?",
            optionA: "Parses JSON text",
            optionB: "Converts a value to JSON text",
            optionC: "Deletes a key",
            optionD: "Clones the DOM",
            correctAnswer: "B"
        },
        {
            question: "Which method adds an item to the end of an array?",
            optionA: "shift()",
            optionB: "unshift()",
            optionC: "push()",
            optionD: "pop()",
            correctAnswer: "C"
        },
        {
            question: 'What does "===" check?',
            optionA: "Value only",
            optionB: "Value and type",
            optionC: "Type only",
            optionD: "Reference only",
            correctAnswer: "B"
        }
    ];


    let score = 0;
    let currentQuestion = 0;


    const quizArea =
        document.getElementById("quiz-area");

    const scoreDisplay =
        document.getElementById("score");

    const submitButton =
        document.getElementById("submit-btn");

    const startButton =
        document.getElementById("start-btn");


    scoreDisplay.textContent = score;


    // Display a question
    function displayQuestion() {

        const question =
            QUESTIONS[currentQuestion];


        quizArea.innerHTML = `
            <p>${question.question}</p>

            <ul class="quiz-options">

                <li>
                    <label>
                        <input type="radio" name="answer" value="A">
                        A. ${question.optionA}
                    </label>
                </li>

                <li>
                    <label>
                        <input type="radio" name="answer" value="B">
                        B. ${question.optionB}
                    </label>
                </li>

                <li>
                    <label>
                        <input type="radio" name="answer" value="C">
                        C. ${question.optionC}
                    </label>
                </li>

                <li>
                    <label>
                        <input type="radio" name="answer" value="D">
                        D. ${question.optionD}
                    </label>
                </li>

            </ul>
        `;
    }


    // Start the game
    startButton.addEventListener(
        "click",
        function() {

            score = 0;
            currentQuestion = 0;

            scoreDisplay.textContent = score;

            submitButton.style.display =
                "inline-block";

            startButton.textContent =
                "RESTART GAME";

            displayQuestion();

        }
    );


    // Submit answer
    submitButton.addEventListener(
        "click",
        async function() {

            const selectedAnswer =
                document.querySelector(
                    'input[name="answer"]:checked'
                );


            if (!selectedAnswer) {

                alert(
                    "Choose an answer first."
                );

                return;
            }


            const userAnswer =
                selectedAnswer.value;

            const correctAnswer =
                QUESTIONS[currentQuestion]
                    .correctAnswer;


            if (userAnswer === correctAnswer) {

                alert("Correct Answer");

                score = score + 1;

            } else {

                alert(
                    "Incorrect Answer. Correct Answer: "
                    + correctAnswer
                );

            }


            scoreDisplay.textContent =
                score;


            currentQuestion =
                currentQuestion + 1;


            // Check if quiz is completed
            if (
                currentQuestion >=
                QUESTIONS.length
            ) {

                quizArea.innerHTML = `
                    <p>Quiz Completed</p>
                    <p>Final Score: ${score}</p>
                `;


                submitButton.style.display =
                    "none";


                // Save score to Firebase
                try {

                    await updateUserProfile(
                        fbUser.uid,
                        {
                            quizScore: score
                        }
                    );

                } catch (error) {

                    console.error(
                        "Unable to save quiz score:",
                        error
                    );

                }


                startButton.textContent =
                    "PLAY AGAIN";


            } else {

                displayQuestion();

            }

        }
    );

});