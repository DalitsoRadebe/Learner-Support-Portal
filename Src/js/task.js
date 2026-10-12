import "./cloud.js";

const user = auth('student');

function render() {
  const term = document.getElementById('search').value.trim().toLowerCase();
  const filter = document.getElementById('filter').value;
  const sort = document.getElementById('sort').value;

  const all = getTasks(user.email);
  let tasks = all.filter(t => t.title.toLowerCase().includes(term));

  if (filter === 'pending') tasks = tasks.filter(t => !t.completed && !isOverdue(t));
  if (filter === 'completed') tasks = tasks.filter(t => t.completed);
  if (filter === 'overdue') tasks = tasks.filter(isOverdue);

  tasks.sort((a, b) => sort === 'title'
    ? a.title.localeCompare(b.title)
    : parseDate(a.date) - parseDate(b.date));

  const emptyText = all.length
    ? 'No tasks match your search or filter.'
    : 'No tasks yet. Add one of your own, or wait for your facilitator to send you one.';

  document.getElementById('task-rows').innerHTML = tasks.map(t => {
    const status = taskStatus(t);
    // Facilitators send tasks; learners can also add their own
    // (task-form.html) and share them with a facilitator. Learners open one
    // to read it and do the work (task-view.html), and can delete only the
    // tasks they added.
    const from = (t.assignedBy
      ? `<div class="muted">Assigned by ${escapeHtml(t.assignedByName || 'your facilitator')}</div>`
      : t.sharedWith
        ? `<div class="muted">Added by you · shared with ${escapeHtml(t.sharedWithName || t.sharedWith)}</div>`
        : '<div class="muted">Added by you</div>')
      + (t.attachment ? '<div class="muted">Has an attached file</div>' : '');
    const action = !reviewerOf(t) ? 'Open'
      : isMarked(t) ? 'View feedback' : t.submission ? 'View submission' : 'Open and submit';
    const remove = t.assignedBy
      ? ''
      : `<button type="button" class="danger" data-id="${escapeHtml(t.id)}">Delete</button>`;
    return `
      <tr>
        <td><span class="${t.completed ? 'task-done' : ''}">${escapeHtml(t.title)}</span>${from}</td>
        <td>${escapeHtml(t.category || 'Other')}</td>
        <td>${escapeHtml(formatDate(t.date))}</td>
        <td><span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span></td>
        <td>
          <div class="row-actions">
            <a href="task-view.html?id=${encodeURIComponent(t.id)}">${action}</a>
            ${remove}
          </div>
        </td>
      </tr>`;
  }).join('') || `<tr><td colspan="5">${emptyText}</td></tr>`;
}

if (user) {
  renderShell('tasks');

  ['search', 'filter', 'sort'].forEach(id => document.getElementById(id).addEventListener('input', render));
  render();

  document.getElementById('task-rows').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn || !confirm('Delete this task?')) return;
    deleteTask(user.email, btn.dataset.id);
    render();
  });
}
