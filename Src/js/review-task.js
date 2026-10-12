import "./cloud.js";

// A facilitator reads one student's work on one task, marks it, writes
// feedback, and can book a support session for that student. The task is one
// this facilitator sent, or one the student added and shared with them.

const user = auth('facilitator');

const params = new URLSearchParams(window.location.search);
const student = user ? getStudents().find(s => s.email === params.get('student')) : null;

function currentTask() {
  return getTasks(student.email).find(t => t.id === params.get('id')
    && (t.assignedBy === user.email || t.sharedWith === user.email));
}

function renderTask() {
  const task = currentTask();
  const status = taskStatus(task);

  document.getElementById('task-title').textContent = task.title;
  document.getElementById('task-meta').innerHTML = `
    <span>${escapeHtml(student.name)}</span>
    <span class="muted">${escapeHtml(task.category || 'Other')} · due ${escapeHtml(formatDate(task.date))}</span>
    <span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span>
    ${task.sharedWith ? '<span class="muted">Added and shared by the student</span>' : ''}`;
  document.getElementById('task-instructions').textContent = task.instructions
    || (task.sharedWith ? 'The student added no notes.' : 'No instructions were given.');
  document.getElementById('task-attachment').innerHTML = task.attachment ? fileButtonHtml(task.attachment) : '';

  const work = task.submission;
  document.getElementById('work-heading').textContent = `${student.name}'s work`;
  document.getElementById('work').innerHTML = work
    ? `<p class="muted">Submitted ${escapeHtml(formatDate(work.submittedAt))}</p>
       ${work.text ? `<p class="work-text">${escapeHtml(work.text)}</p>` : ''}
       ${work.file ? fileButtonHtml(work.file) : ''}`
    : '<p class="muted">Nothing has been submitted yet. You can mark the task once the student uploads their work.</p>';

  document.getElementById('mark').disabled = !work;
  document.getElementById('feedback').disabled = !work;
  document.getElementById('mark-btn').disabled = !work;
  document.getElementById('mark-btn').textContent = isMarked(task) ? 'UPDATE MARK AND FEEDBACK' : 'SEND MARK AND FEEDBACK';
}

function renderBookings() {
  const bookings = getBookings(student.email)
    .filter(b => b.bookedBy === user.email)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  document.getElementById('booking-list').innerHTML = bookings.map(b => `
    <li>
      <span>
        <strong>${escapeHtml(formatDate(b.date))} at ${escapeHtml(b.time)}</strong><br />
        <span class="muted">${escapeHtml(b.topic)}</span>
        ${b.notes ? `<br /><span class="muted">${escapeHtml(b.notes)}</span>` : ''}
      </span>
      <span class="row-actions">
        <button type="button" class="danger" data-id="${escapeHtml(b.id)}">Cancel</button>
      </span>
    </li>`).join('');
}

if (user && (!student || !currentTask())) {
  // Wrong link, or the task was deleted.
  window.location.replace('assign-task.html');
} else if (user) {
  renderShell('assign');
  renderTask();
  renderBookings();

  const first = currentTask();
  const markEl = document.getElementById('mark');
  const feedbackEl = document.getElementById('feedback');
  if (isMarked(first)) markEl.value = first.mark;
  feedbackEl.value = first.feedback || '';

  document.getElementById('mark-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('mark-error');
    const mark = Number(markEl.value);
    errorEl.textContent = '';

    if (markEl.value.trim() === '' || !Number.isInteger(mark) || mark < 0 || mark > 100) {
      errorEl.textContent = 'Please enter a mark from 0 to 100.';
      return;
    }

    updateTask(student.email, first.id, {
      mark,
      feedback: feedbackEl.value.trim(),
      markedAt: new Date().toISOString(),
    });
    renderTask();
    flashMessage(`Mark and feedback sent to ${student.name}.`);
  });

  const dateEl = document.getElementById('date');
  dateEl.min = todayString();

  document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = dateEl.value;
    const time = document.getElementById('time').value;
    const notes = document.getElementById('notes').value.trim();
    const errorEl = document.getElementById('booking-error');
    errorEl.textContent = '';

    if (!date || !time) {
      errorEl.textContent = 'Please choose a date and a time.';
      return;
    }
    if (dayDiffFromToday(date) < 0) {
      errorEl.textContent = 'Please choose a date that is today or later.';
      return;
    }
    if (getBookings(student.email).some(b => b.bookedBy === user.email && b.date === date && b.time === time)) {
      errorEl.textContent = 'You have already booked this student at that time.';
      return;
    }

    addBooking(student.email, {
      topic: first.title,
      date,
      time,
      notes,
      bookedBy: user.email,
      bookedByName: user.name,
    });
    e.target.reset();
    renderBookings();
    flashMessage(`Support session booked for ${student.name}.`);
  });

  document.getElementById('booking-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn || !confirm('Cancel this support session?')) return;
    deleteBooking(student.email, btn.dataset.id);
    renderBookings();
  });
}
