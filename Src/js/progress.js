<<<<<<< HEAD
import "./cloud.js";

const user = requireAuth('student');
=======
const user = auth('student');
>>>>>>> 7f7d19d161b4d024c41f06d06df9a656f5f89086

if (user) {
  renderShell('progress');

  const tasks = getTasks(user.email);
  const stats = taskStats(tasks);

  document.getElementById('progress-fill').style.width = stats.progress + '%';
  document.getElementById('progress-label').textContent = stats.progress + '%';
  document.getElementById('progress-track').setAttribute('aria-valuenow', stats.progress);

  // Overall progress is the share of all your tasks (from facilitators and
  // your own) that you have completed. Marks are shown alongside it.
  const marked = tasks.filter(isMarked);
  const averageMark = marked.length
    ? Math.round(marked.reduce((sum, t) => sum + Number(t.mark), 0) / marked.length)
    : null;
  document.getElementById('progress-detail').textContent = !stats.total
    ? 'You have no tasks yet.'
    : `${stats.completed} of ${stats.total} tasks completed`
      + (averageMark === null ? ' · no marks yet' : ` · average mark ${averageMark}% across ${marked.length} marked task${marked.length === 1 ? '' : 's'}`);
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
