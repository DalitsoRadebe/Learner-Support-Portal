import "./cloud.js";

// A learner adds a task of their own to My Tasks, optionally with a file.
// The task is private unless the learner shares it with a facilitator, who
// can then see it and mark it. Facilitators send theirs from assign-task.html.

const user = requireAuth('student');

if (user) {
  renderShell('tasks');

  const dateEl = document.getElementById('date');
  const fileEl = document.getElementById('file');
  const saveBtn = document.getElementById('save-btn');
  dateEl.min = todayString();
  document.getElementById('category').innerHTML = TASK_CATEGORIES.map(c => `<option>${escapeHtml(c)}</option>`).join('');
  document.getElementById('file-hint').textContent = `One file, up to ${formatSize(MAX_FILE_BYTES)}.`;

  // Only facilitators who are on Firebase can be shared with.
  const facilitators = getFacilitators().filter(f => f.uid);
  document.getElementById('share').innerHTML = '<option value="">Only me</option>'
    + facilitators.map(f => `<option value="${escapeHtml(f.email)}">${escapeHtml(f.name)} (${escapeHtml(f.email)})</option>`).join('');

  document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const date = dateEl.value;
    const instructions = document.getElementById('instructions').value.trim();
    const file = fileEl.files[0];
    const shareWith = facilitators.find(f => f.email === document.getElementById('share').value);
    const errorEl = document.getElementById('error');
    errorEl.textContent = '';

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

    const task = { title, category, date, instructions };
    if (shareWith) {
      task.sharedWith = shareWith.email;
      task.sharedWithName = shareWith.name;
      task.sharedWithUid = shareWith.uid;
    }
    if (file) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'UPLOADING…';
      try {
        // The facilitator it is shared with (if any) can read the file too.
        task.attachment = await window.cloud.uploadFile(file, [task.sharedWithUid]);
      } catch (error) {
        console.error(error);
        errorEl.textContent = 'The file could not be uploaded, so the task was not saved. Please try again.';
        saveBtn.disabled = false;
        saveBtn.textContent = 'SAVE TASK';
        return;
      }
    }

    // Wait for Firestore before leaving the page, or the save could be cut off.
    saveBtn.disabled = true;
    saveBtn.textContent = 'SAVING…';
    await addTask(user.email, task);
    window.location.href = 'tasks.html';
  });
}
