const user = requireAuth('facilitator');

const ALL_STUDENTS = '__all__';

function renderStudentOptions() {
  const students = getStudents();
  const select = document.getElementById('student');
  const sendBtn = document.getElementById('send-btn');

  if (!students.length) {
    select.innerHTML = '<option value="">No students registered yet</option>';
    select.disabled = true;
    sendBtn.disabled = true;
    return;
  }

  select.innerHTML = `<option value="${ALL_STUDENTS}">All students (${students.length})</option>`
    + students.map(s => `<option value="${escapeHtml(s.email)}">${escapeHtml(s.name)} (${escapeHtml(s.email)})</option>`).join('');
}

function renderAssigned() {
  const tasks = getAssignedTasks(user.email)
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  document.getElementById('assigned-rows').innerHTML = tasks.map(t => {
    const status = taskStatus(t);
    return `
      <tr>
        <td>${escapeHtml(t.title)}<div class="muted">${escapeHtml(t.category || 'Other')}</div></td>
        <td>${escapeHtml(t.studentName)}</td>
        <td>${escapeHtml(formatDate(t.date))}</td>
        <td><span class="status-pill ${status.cls}">${status.label}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" class="danger" data-id="${escapeHtml(t.id)}" data-student="${escapeHtml(t.studentEmail)}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('') || '<tr><td colspan="5">You have not sent any tasks yet.</td></tr>';
}

if (user) {
  renderShell('assign');

  const dateEl = document.getElementById('date');
  dateEl.min = todayString();
  document.getElementById('category').innerHTML = TASK_CATEGORIES.map(c => `<option>${escapeHtml(c)}</option>`).join('');

  renderStudentOptions();
  renderAssigned();

  document.getElementById('assign-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentValue = document.getElementById('student').value;
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const date = dateEl.value;
    const instructions = document.getElementById('instructions').value.trim();
    const errorEl = document.getElementById('error');
    errorEl.textContent = '';

    if (!studentValue) {
      errorEl.textContent = 'Please choose a student to send the task to.';
      return;
    }
    if (!title || !date) {
      errorEl.textContent = 'Please give the task a title and a due date.';
      return;
    }
    if (dayDiffFromToday(date) < 0) {
      errorEl.textContent = 'Please choose a due date that is today or later.';
      return;
    }

    const students = studentValue === ALL_STUDENTS
      ? getStudents()
      : getStudents().filter(s => s.email === studentValue);

    assignTask(user, students, { title, category, date, instructions });

    e.target.reset();
    renderAssigned();
    flashMessage(students.length === 1
      ? `Task sent to ${students[0].name}.`
      : `Task sent to ${students.length} students.`);
  });

  document.getElementById('assigned-rows').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn || !confirm('Delete this task? The student will no longer see it.')) return;
    deleteTask(btn.dataset.student, btn.dataset.id);
    renderAssigned();
  });
}
