import "./cloud.js";

const user = auth('facilitator');

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

// Work waiting to be marked comes first, then soonest due date.
function needsMarking(task) {
  return Boolean(task.submission) && !isMarked(task);
}

function renderAssigned() {
  const tasks = getAssignedTasks(user.email)
    .sort((a, b) => (needsMarking(b) - needsMarking(a)) || (parseDate(a.date) - parseDate(b.date)));

  document.getElementById('assigned-rows').innerHTML = tasks.map(t => {
    const status = taskStatus(t);
    const reviewUrl = `review-task.html?student=${encodeURIComponent(t.studentEmail)}&id=${encodeURIComponent(t.id)}`;
    return `
      <tr>
        <td>${escapeHtml(t.title)}<div class="muted">${escapeHtml(t.category || 'Other')}${t.sharedWith ? ' · shared by the student' : ''}</div></td>
        <td>${escapeHtml(t.studentName)}</td>
        <td>${escapeHtml(formatDate(t.date))}</td>
        <td><span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span></td>
        <td>
          <div class="row-actions">
            <a href="${escapeHtml(reviewUrl)}">${needsMarking(t) ? 'Mark' : 'Open'}</a>
            ${t.assignedBy === user.email
              ? `<button type="button" class="danger" data-id="${escapeHtml(t.id)}" data-student="${escapeHtml(t.studentEmail)}">Delete</button>`
              : ''}
          </div>
        </td>
      </tr>`;
  }).join('') || '<tr><td colspan="5">You have not sent any tasks yet, and no student has shared one with you.</td></tr>';
}

if (user) {
  renderShell('assign');

  const dateEl = document.getElementById('date');
  const fileEl = document.getElementById('file');
  const sendBtn = document.getElementById('send-btn');
  dateEl.min = todayString();
  document.getElementById('category').innerHTML = TASK_CATEGORIES.map(c => `<option>${escapeHtml(c)}</option>`).join('');
  document.getElementById('file-hint').textContent = `One file, up to ${formatSize(MAX_FILE_BYTES)}.`;

  renderStudentOptions();
  renderAssigned();

  document.getElementById('assign-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentValue = document.getElementById('student').value;
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const date = dateEl.value;
    const instructions = document.getElementById('instructions').value.trim();
    const file = fileEl.files[0];
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
    if (file && file.size > MAX_FILE_BYTES) {
      errorEl.textContent = `That file is too big. Please choose one under ${formatSize(MAX_FILE_BYTES)}.`;
      return;
    }

    const students = studentValue === ALL_STUDENTS
      ? getStudents()
      : getStudents().filter(s => s.email === studentValue);

    const task = { title, category, date, instructions };
    if (file) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'UPLOADING…';
      try {
        // One copy of the file, readable by every student it is sent to.
        task.attachment = await window.cloud.uploadFile(file, students.map(s => s.uid));
      } catch (error) {
        console.error(error);
        errorEl.textContent = 'The file could not be uploaded, so the task was not sent. Please try again.';
        return;
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'SEND TASK';
      }
    }

    assignTask(user, students, task);

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
