const user = requireAuth('student');

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
    : 'No tasks yet. Your facilitator has not sent you any.';

  document.getElementById('task-rows').innerHTML = tasks.map(t => {
    const status = taskStatus(t);
    // Learners can only mark tasks complete — facilitators create and delete them.
    const from = (t.assignedBy
      ? `<div class="muted">Assigned by ${escapeHtml(t.assignedByName || 'your facilitator')}</div>`
      : '')
      + (t.instructions ? `<div class="muted">${escapeHtml(t.instructions)}</div>` : '');
    return `
      <tr>
        <td><span class="${t.completed ? 'task-done' : ''}">${escapeHtml(t.title)}</span>${from}</td>
        <td>${escapeHtml(t.category || 'Other')}</td>
        <td>${escapeHtml(formatDate(t.date))}</td>
        <td><span class="status-pill ${status.cls}">${status.label}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" data-action="complete" data-id="${escapeHtml(t.id)}">${t.completed ? 'Mark incomplete' : 'Complete'}</button>
          </div>
        </td>
      </tr>`;
  }).join('') || `<tr><td colspan="5">${emptyText}</td></tr>`;
}

if (user) {
  renderShell('tasks');

  document.getElementById('task-rows').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'complete') {
      const task = getTasks(user.email).find(t => t.id === id);
      if (task) updateTask(user.email, id, { completed: !task.completed });
    }
    render();
  });

  ['search', 'filter', 'sort'].forEach(id => document.getElementById(id).addEventListener('input', render));
  render();
}
