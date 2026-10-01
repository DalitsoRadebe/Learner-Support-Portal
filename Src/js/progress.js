const user = requireAuth('student');

if (user) {
  renderShell('progress');

  const tasks = getTasks(user.email);
  const stats = taskStats(tasks);

  document.getElementById('progress-fill').style.width = stats.progress + '%';
  document.getElementById('progress-label').textContent = stats.progress + '%';
  document.getElementById('progress-track').setAttribute('aria-valuenow', stats.progress);
  document.getElementById('stat-completed').textContent = stats.completed;
  document.getElementById('stat-outstanding').textContent = stats.outstanding;
  document.getElementById('stat-overdue').textContent = stats.overdue;
  document.getElementById('stat-quiz').textContent = getQuizScore(user.email);

  const categories = [...new Set(tasks.map(t => t.category || 'Other'))].sort();
  document.getElementById('category-list').innerHTML = categories.map(category => {
    const s = taskStats(tasks.filter(t => (t.category || 'Other') === category));
    return `<li><span>${escapeHtml(category)}</span><span>${s.completed} of ${s.total} done (${s.progress}%)</span></li>`;
  }).join('') || '<li><span>No tasks yet.</span></li>';

  const activity = [
    ...tasks.filter(isOverdue).map(t => `${t.title} task overdue`),
    ...tasks.filter(t => t.completed).map(t => `${t.title} task completed`),
    ...getBookings(user.email).map(b => `Support session booked for ${formatDate(b.date)}`),
  ];

  document.getElementById('activity-list').innerHTML = activity.slice(0, 8)
    .map(a => `<li><span>${escapeHtml(a)}</span></li>`).join('')
    || '<li><span>No activity yet.</span></li>';
}
