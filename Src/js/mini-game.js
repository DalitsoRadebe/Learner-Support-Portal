const user = requireAuth('student');

const POINTS_PER_QUESTION = 20;
const QUESTIONS = [
  { q: 'Which method filters an array?', options: ['map()', 'filter()', 'reduce()', 'loop()'], answer: 1 },
  { q: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'static'], answer: 1 },
  { q: 'What does JSON.stringify() do?', options: ['Parses JSON text', 'Converts a value to JSON text', 'Deletes a key', 'Clones the DOM'], answer: 1 },
  { q: 'Which method adds an item to the end of an array?', options: ['shift()', 'unshift()', 'push()', 'pop()'], answer: 2 },
  { q: 'What does "===" check?', options: ['Value only', 'Value and type', 'Type only', 'Reference only'], answer: 1 },
];

if (user) {
  renderShell('game');

  const quizArea = document.getElementById('quiz-area');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const feedback = document.getElementById('feedback');
  const submitBtn = document.getElementById('submit-btn');
  const startBtn = document.getElementById('start-btn');

  let current = 0;
  let score = 0;
  let best = getQuizScore(user.email);
  bestEl.textContent = best;

  function renderQuestion() {
    const item = QUESTIONS[current];
    quizArea.innerHTML = `
      <p class="muted">Question ${current + 1} of ${QUESTIONS.length}</p>
      <p>${escapeHtml(item.q)}</p>
      <ul class="quiz-options">
        ${item.options.map((opt, i) => `
          <li><label><input type="radio" name="answer" value="${i}" /> ${String.fromCharCode(97 + i)}. ${escapeHtml(opt)}</label></li>
        `).join('')}
      </ul>
    `;
  }

  function finish() {
    const correct = score / POINTS_PER_QUESTION;
    const isNewBest = score > best;
    if (isNewBest) {
      best = score;
      setQuizScore(user.email, best);
      bestEl.textContent = best;
    }
    quizArea.innerHTML = `
      <p>Challenge complete! You got ${correct} of ${QUESTIONS.length} right.</p>
      <p>Final score: <strong>${score}</strong>${isNewBest ? ' — new best!' : ''}</p>
    `;
    submitBtn.hidden = true;
  }

  startBtn.addEventListener('click', () => {
    current = 0;
    score = 0;
    scoreEl.textContent = score;
    feedback.textContent = '';
    submitBtn.hidden = false;
    startBtn.textContent = 'RESTART GAME';
    renderQuestion();
  });

  submitBtn.addEventListener('click', () => {
    const picked = document.querySelector('input[name="answer"]:checked');
    if (!picked) {
      feedback.textContent = 'Choose an answer first.';
      return;
    }
    feedback.textContent = '';
    if (Number(picked.value) === QUESTIONS[current].answer) {
      score += POINTS_PER_QUESTION;
      scoreEl.textContent = score;
    }
    current += 1;
    if (current >= QUESTIONS.length) finish();
    else renderQuestion();
  });
}
