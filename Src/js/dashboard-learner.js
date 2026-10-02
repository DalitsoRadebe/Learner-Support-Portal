const user = requireAuth('student');

if (user) {
  renderShell('dashboard');
  document.getElementById('greeting').textContent = `Welcome, ${user.name.split(' ')[0]}`;

  const tasks = getTasks(user.email);
  const stats = taskStats(tasks);

  document.getElementById('stat-outstanding').textContent = stats.outstanding;
  document.getElementById('stat-completed').textContent = stats.completed;
  document.getElementById('stat-all').textContent = stats.total;
  document.getElementById('stat-progress').textContent = stats.progress + '%';

  // Unfinished work first, soonest due date at the top.
  const recent = [...tasks]
    .sort((a, b) => (a.completed - b.completed) || (parseDate(a.date) - parseDate(b.date)))
    .slice(0, 5);

  document.getElementById('recent-list').innerHTML = recent.map(t => {
    const status = taskStatus(t);
    return `<li>
      <span>${escapeHtml(t.title)} <span class="muted">· due ${escapeHtml(formatDate(t.date))}</span></span>
      <span class="status-pill ${status.cls}">${status.label}</span>
    </li>`;
  }).join('') || '<li><span>No tasks yet — your facilitator has not sent you any.</span></li>';
}
