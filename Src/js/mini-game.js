import "./cloud.js";

// Debug Challenge: each level is a small JavaScript program. In a "fix"
// level the program is broken (a syntax error, a missing bracket or a missing
// semicolon) and the learner edits it until running it prints the expected
// output. In a "predict" level the learner reads working code and picks what
// it prints. Every solved level is worth BASE_POINTS, plus a speed bonus.

const user = auth('student');

const BASE_POINTS = 100;
const MAX_BONUS = 50;
// Seconds a level can take and still earn some speed bonus.
const BONUS_WINDOW = { fix: 90, predict: 30 };
const RUN_TIMEOUT_MS = 2000;

// `mustMatch` stops a fix level being "solved" by deleting the program and
// printing the answer directly: the fixed code must still contain these.
const LEVELS = [
  {
    type: 'fix',
    goal: 'This should greet Ada. Fix the syntax error, then press Run.',
    code: 'const name = "Ada";\nconsole.log("Hello, " + name;',
    expected: 'Hello, Ada',
    mustMatch: [/\+\s*name/],
    hint: 'Every ( needs a matching ). Look at the end of the console.log line.',
  },
  {
    type: 'predict',
    goal: 'What does this code print?',
    code: 'let x = 3;\nx += 2;\nconsole.log(x * 2);',
    options: ['10', '8', '32', '5'],
    answer: 0,
    explain: 'x starts at 3, += 2 makes it 5, and 5 * 2 is 10.',
    hint: 'x += 2 is the same as x = x + 2.',
  },
  {
    type: 'fix',
    goal: 'double(4) should print 8. Something is missing.',
    code: 'function double(n) {\n  return n * 2;\n\nconsole.log(double(4));',
    expected: '8',
    mustMatch: [/function double/, /double\(4\)/],
    hint: 'The function body opens with { but never closes.',
  },
  {
    type: 'predict',
    goal: 'What does this code print?',
    code: 'console.log("5" + 3);',
    options: ['8', '53', 'NaN', 'An error'],
    answer: 1,
    explain: 'When one side of + is a string, JavaScript joins them as text: "5" + 3 is "53".',
    hint: 'Look closely: "5" is in quotes.',
  },
  {
    type: 'fix',
    goal: 'This should print "Hi Sam" and then "Hi Lee". Run it to see the error.',
    code: 'const greeting = "Hi"\nconst names = ["Sam", "Lee"]\n[0, 1].forEach(i => console.log(greeting + " " + names[i]))',
    expected: 'Hi Sam\nHi Lee',
    mustMatch: [/forEach/, /names\[i\]/],
    hint: 'A line starting with [ is joined onto the line above it. A semicolon at the end of line 2 keeps them apart.',
  },
  {
    type: 'fix',
    goal: 'This loop should print every score. Fix the syntax error.',
    code: 'const scores = [70, 85, 90];\nfor (let i = 0; i < scores.length; i++ {\n  console.log(scores[i]);\n}',
    expected: '70\n85\n90',
    mustMatch: [/for\s*\(/, /scores\[i\]/],
    hint: 'Count the brackets on the for line. The ( after for is never closed.',
  },
  {
    type: 'predict',
    goal: 'What does this code print?',
    code: 'const items = [1, 2, 3];\nconst result = items\n  .map(n => n * n)\n  .filter(n => n > 2);\nconsole.log(result.length);',
    options: ['1', '2', '3', '9'],
    answer: 1,
    explain: 'map gives [1, 4, 9]; filter keeps the ones over 2, [4, 9]; that is 2 items.',
    hint: 'Work it out step by step: first the map, then the filter.',
  },
  {
    type: 'fix',
    goal: 'This should print "Thabo has 40 points". Fix the object.',
    code: 'const learner = {\n  name: "Thabo"\n  points: 40\n};\nconsole.log(learner.name + " has " + learner.points + " points");',
    expected: 'Thabo has 40 points',
    mustMatch: [/learner\.name/, /learner\.points/],
    hint: 'The properties in an object are separated by commas.',
  },
  {
    type: 'predict',
    goal: 'What does this code print?',
    code: 'console.log(0 == "0", 0 === "0");',
    options: ['true true', 'true false', 'false true', 'false false'],
    answer: 1,
    explain: '== converts "0" to a number before comparing, so it is true. === also checks the type, and a number is not a string, so it is false.',
    hint: '=== checks the type as well as the value.',
  },
  {
    type: 'fix',
    goal: 'This should print "big". Run it and read the error carefully.',
    code: 'let total = 10\n(total > 5) ? console.log("big") : console.log("small")',
    expected: 'big',
    mustMatch: [/total\s*>\s*5/],
    hint: 'A line starting with ( is joined onto the line above, so JavaScript reads it as 10(total > 5), all inside the let. Add a semicolon after 10.',
  },
];

// ---------- Running the learner's code ----------
// The code runs in a Web Worker, so an endless loop cannot freeze the page:
// the worker is stopped after RUN_TIMEOUT_MS.

const WORKER_SOURCE = `
  const show = (v) => {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') { try { return JSON.stringify(v); } catch (e) { return String(v); } }
    return String(v);
  };
  self.onmessage = (e) => {
    const out = [];
    console.log = (...args) => out.push(args.map(show).join(' '));
    try {
      new Function(e.data)();
      self.postMessage({ out });
    } catch (err) {
      self.postMessage({ out, error: { name: err.name, message: err.message } });
    }
  };
`;
const workerUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));

function runCode(code) {
  return new Promise(resolve => {
    const worker = new Worker(workerUrl);
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ out: [], error: { name: 'Timeout', message: 'Your code ran for too long. Is there a loop that never ends?' } });
    }, RUN_TIMEOUT_MS);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.postMessage(code);
  });
}

// A plain-English tip for the error the learner's code threw.
function errorTip({ name, message }) {
  if (/missing \) after argument list/.test(message)) return 'A ( was opened but never closed.';
  if (/Unexpected end of input/.test(message)) return 'Something was opened and never closed: a {, ( or [ , or a quote.';
  if (/Unexpected identifier/.test(message)) return 'Two things are side by side with nothing between them. Is a comma, operator or semicolon missing?';
  if (/Unexpected token/.test(message)) return 'A symbol is missing or in the wrong place. Check your brackets.';
  if (name === 'TypeError' && /is not a function|Cannot read prop/.test(message)) {
    return 'JavaScript joined two lines into one. A missing semicolon can do that.';
  }
  if (/before initialization/.test(message)) {
    return 'A variable is used in the same statement that creates it. A missing semicolon may have joined two lines.';
  }
  if (name === 'ReferenceError') return 'A name is used that was never created. Check the spelling.';
  return '';
}

function sameOutput(lines, expected) {
  return lines.map(l => l.trimEnd()).join('\n').trim() === expected.trim();
}

// ---------- The game ----------

if (user) {
  renderShell('game');

  const el = id => document.getElementById(id);
  const outputEl = el('output');
  const codeEl = el('code');
  const gutterEl = el('gutter');
  const runBtn = el('run-btn');

  let state = 'idle'; // idle | playing | solved | finished
  let levelIndex = 0;
  let score = 0;
  let solvedCount = 0;
  let startedAt = 0;
  let timerId = null;
  let best = getQuizScore(user.email);
  el('best').textContent = best;

  const level = () => LEVELS[levelIndex];
  const elapsedSeconds = () => Math.floor((Date.now() - startedAt) / 1000);

  function updateGutter() {
    const lines = codeEl.value.split('\n').length;
    gutterEl.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    gutterEl.scrollTop = codeEl.scrollTop;
  }

  function showTimer() {
    const s = elapsedSeconds();
    el('timer').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
  }

  function print(text, kind = '') {
    outputEl.className = kind;
    outputEl.textContent = text;
  }

  // Full points for an instant answer, falling to none at the window's end.
  function speedBonus() {
    const limit = BONUS_WINDOW[level().type];
    return Math.round(MAX_BONUS * Math.max(0, 1 - elapsedSeconds() / limit));
  }

  function award() {
    const bonus = speedBonus();
    score += BASE_POINTS + bonus;
    solvedCount += 1;
    el('score').textContent = score;
    return bonus;
  }

  function startLevel(index) {
    levelIndex = index;
    const lv = level();
    state = 'playing';

    el('mode').textContent = lv.type === 'fix' ? 'Fix the bug' : 'Predict the output';
    el('level').textContent = `Level ${index + 1} / ${LEVELS.length}`;
    el('goal-text').textContent = lv.goal;
    el('goal').hidden = false;
    el('hint-text').textContent = lv.hint;
    el('hint').hidden = true;
    el('hint-btn').hidden = false;
    el('skip-btn').hidden = false;

    codeEl.value = lv.code;
    codeEl.readOnly = lv.type !== 'fix';
    codeEl.scrollTop = 0;
    updateGutter();

    const choices = el('choices');
    choices.hidden = lv.type !== 'predict';
    choices.innerHTML = lv.type === 'predict'
      ? lv.options.map((opt, i) => `<button type="button" class="cg-choice" data-choice="${i}">${escapeHtml(opt)}</button>`).join('')
      : '';

    runBtn.hidden = lv.type !== 'fix';
    runBtn.innerHTML = '&#9654; Run';
    print(lv.type === 'fix'
      ? 'Press Run to try the code.'
      : 'Read the code, then pick what it prints.');

    startedAt = Date.now();
    showTimer();
    stopTimer();
    timerId = setInterval(showTimer, 1000);
    if (lv.type === 'fix') codeEl.focus();
  }

  function levelDone() {
    state = 'solved';
    stopTimer();
    el('skip-btn').hidden = true;
    el('hint-btn').hidden = true;
    runBtn.hidden = false;
    runBtn.innerHTML = levelIndex + 1 < LEVELS.length ? 'Next level &#9654;' : 'See results &#9654;';
  }

  function finish() {
    state = 'finished';
    stopTimer();
    const isNewBest = score > best;
    if (isNewBest) {
      best = score;
      setQuizScore(user.email, best);
      el('best').textContent = best;
    }
    el('mode').textContent = 'Results';
    el('goal').hidden = true;
    el('hint').hidden = true;
    el('hint-btn').hidden = true;
    el('skip-btn').hidden = true;
    el('choices').hidden = true;
    codeEl.readOnly = true;
    codeEl.value = `// You solved ${solvedCount} of ${LEVELS.length} levels.\n// Final score: ${score}${isNewBest ? ' (new best!)' : ''}`;
    updateGutter();
    print(`Challenge complete!\nSolved ${solvedCount} of ${LEVELS.length} · Score ${score}${isNewBest ? ' · New best!' : ''}`, 'cg-ok');
    runBtn.hidden = false;
    runBtn.innerHTML = '&#8635; Play again';
  }

  function nextLevel() {
    if (levelIndex + 1 < LEVELS.length) startLevel(levelIndex + 1);
    else finish();
  }

  async function runFix() {
    const lv = level();
    runBtn.disabled = true;
    print('Running…');
    const result = await runCode(codeEl.value);
    runBtn.disabled = false;
    if (state !== 'playing') return;

    const printed = result.out.length ? result.out.join('\n') + '\n' : '';
    if (result.error) {
      const tip = errorTip(result.error);
      print(`${printed}✗ ${result.error.name}: ${result.error.message}${tip ? `\n\nTip: ${tip}` : ''}`, 'cg-error');
      return;
    }
    if (!sameOutput(result.out, lv.expected)) {
      print(`${printed || '(nothing was printed)\n'}\n✗ Not quite. It should print:\n${lv.expected}`, 'cg-error');
      return;
    }
    if (!lv.mustMatch.every(re => re.test(codeEl.value))) {
      print(`${printed}\n✗ The output is right, but fix the bug instead of rewriting the program.`, 'cg-error');
      return;
    }
    const bonus = award();
    print(`${printed}\n✓ Fixed in ${elapsedSeconds()}s! +${BASE_POINTS} points${bonus ? ` +${bonus} speed bonus` : ''}`, 'cg-ok');
    levelDone();
  }

  async function answerPredict(choice) {
    const lv = level();
    el('choices').querySelectorAll('button').forEach((btn, i) => {
      btn.disabled = true;
      if (i === lv.answer) btn.classList.add('correct');
      else if (i === choice) btn.classList.add('wrong');
    });

    let verdict;
    let kind;
    if (choice === lv.answer) {
      const bonus = award();
      verdict = `✓ Correct in ${elapsedSeconds()}s! +${BASE_POINTS} points${bonus ? ` +${bonus} speed bonus` : ''}`;
      kind = 'cg-ok';
    } else {
      verdict = `✗ Not this time. The answer is ${lv.options[lv.answer]}.`;
      kind = 'cg-error';
    }
    levelDone();
    // Run the code too, so the learner sees the real output.
    const result = await runCode(lv.code);
    print(`${result.out.join('\n')}\n\n${verdict}\n${lv.explain}`, kind);
  }

  runBtn.addEventListener('click', () => {
    if (state === 'idle' || state === 'finished') {
      score = 0;
      solvedCount = 0;
      el('score').textContent = score;
      startLevel(0);
    } else if (state === 'solved') {
      nextLevel();
    } else if (state === 'playing' && level().type === 'fix') {
      runFix();
    }
  });

  el('skip-btn').addEventListener('click', () => {
    if (state === 'playing') nextLevel();
  });

  el('choices').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-choice]');
    if (btn && state === 'playing') answerPredict(Number(btn.dataset.choice));
  });

  el('hint-btn').addEventListener('click', () => {
    el('hint').hidden = false;
    el('hint-btn').hidden = true;
  });

  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => {
    el(btn.dataset.close).hidden = true;
    if (btn.dataset.close === 'hint' && state === 'playing') el('hint-btn').hidden = false;
  }));

  codeEl.addEventListener('input', updateGutter);
  codeEl.addEventListener('scroll', () => { gutterEl.scrollTop = codeEl.scrollTop; });
}
