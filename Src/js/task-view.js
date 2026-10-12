import "./cloud.js";

// A learner reads one task, writes their answer (and can attach a file), and
// submits it to the facilitator. Once it is marked, the mark and feedback are
// shown and the work can no longer be changed. A task the learner added
// themselves works the same way if they shared it with a facilitator;
// otherwise the work is just saved for the learner.

const user = auth('student');

const taskId = new URLSearchParams(window.location.search).get('id');

function currentTask() {
  return getTasks(user.email).find(t => t.id === taskId);
}

function render() {
  const task = currentTask();
  const status = taskStatus(task);
  const work = task.submission;
  const marked = isMarked(task);

  document.getElementById('task-title').textContent = task.title;
  document.getElementById('task-meta').innerHTML = `
    <span class="muted">${escapeHtml(task.category || 'Other')} · due ${escapeHtml(formatDate(task.date))}</span>
    <span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span>
    ${task.assignedBy ? `<span class="muted">Assigned by ${escapeHtml(task.assignedByName || 'your facilitator')}</span>` : ''}
    ${task.sharedWith ? `<span class="muted">Shared with ${escapeHtml(task.sharedWithName || task.sharedWith)}</span>` : ''}`;
  document.getElementById('task-instructions').textContent = task.instructions
    || (task.assignedBy ? 'No instructions were given.' : 'No notes were added.');
  document.getElementById('task-attachment').innerHTML = task.attachment ? fileButtonHtml(task.attachment) : '';

  document.getElementById('feedback-panel').hidden = !marked;
  document.getElementById('submitted-panel').hidden = !marked;
  document.getElementById('work-form').hidden = marked;

  if (marked) {
    document.getElementById('mark-value').textContent = `${task.mark}%`;
    document.getElementById('feedback-text').textContent = task.feedback || 'No written feedback was given.';
    document.getElementById('submitted-work').innerHTML = `
      ${work && work.text ? `<p class="work-text">${escapeHtml(work.text)}</p>` : ''}
      ${work && work.file ? fileButtonHtml(work.file) : ''}`;
    return;
  }

  const own = !reviewerOf(task);
  document.getElementById('work-note').textContent = !work ? (own ? 'Not done yet.' : 'Not submitted yet.')
    : own ? `Saved ${formatDate(work.submittedAt)}. You can change it any time.`
    : `Submitted ${formatDate(work.submittedAt)}. You can change it until your facilitator marks it.`;
  document.getElementById('current-file').innerHTML = work && work.file ? fileButtonHtml(work.file) : '';
  document.getElementById('submit-btn').textContent = own
    ? (work ? 'UPDATE MY WORK' : 'SAVE AND MARK AS DONE')
    : (work ? 'UPDATE SUBMISSION' : 'SUBMIT TO FACILITATOR');
}

if (user && !currentTask()) {
  // Wrong link, or the task was deleted.
  window.location.replace('tasks.html');
} else if (user) {
  renderShell('tasks');
  render();

  const answerEl = document.getElementById('answer');
  const fileEl = document.getElementById('file');
  const submitBtn = document.getElementById('submit-btn');
  const first = currentTask();
  answerEl.value = first.submission ? first.submission.text : '';
  document.getElementById('file-hint').textContent = `One file, up to ${formatSize(MAX_FILE_BYTES)}.`;

  document.getElementById('work-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = currentTask();
    const text = answerEl.value.trim();
    const file = fileEl.files[0];
    const previousFile = task.submission && task.submission.file;
    const errorEl = document.getElementById('error');
    errorEl.textContent = '';

    if (!text && !file && !previousFile) {
      errorEl.textContent = 'Please write your answer or upload a file.';
      return;
    }
    if (file && file.size > MAX_FILE_BYTES) {
      errorEl.textContent = `That file is too big. Please choose one under ${formatSize(MAX_FILE_BYTES)}.`;
      return;
    }

    const submission = { text, submittedAt: todayString() };
    if (previousFile) submission.file = previousFile;

    if (file) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'UPLOADING…';
      try {
        // The facilitator who sent the task, or the one it is shared with,
        // is the only other reader (none for a private task).
        const reviewer = reviewerOf(task);
        submission.file = await window.cloud.uploadFile(file, [reviewer && reviewer.uid]);
      } catch (error) {
        console.error(error);
        errorEl.textContent = 'The file could not be uploaded, so your work was not saved. Please try again.';
        render();
        return;
      } finally {
        submitBtn.disabled = false;
      }
    }

    updateTask(user.email, task.id, { submission, completed: true });
    fileEl.value = '';
    render();
    const reviewer = reviewerOf(task);
    flashMessage(reviewer ? `Your work was sent to ${reviewer.name || 'your facilitator'}.` : 'Your work was saved.');
  });
}
