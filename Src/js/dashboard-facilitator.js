import "./cloud.js";

const user = auth('facilitator');

// Registered learners and their progress on this facilitator's tasks
// (studentOverview in storage.js).
const overview = user ? studentOverview(user.email) : [];

function renderStudents(filter) {
  const term = filter.trim().toLowerCase();
  const rows = overview.filter(s =>
    s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)
  );
  const emptyText = overview.length ? 'No students match your search.' : 'No students have registered yet.';
  document.getElementById('student-rows').innerHTML = rows.map(s => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${s.stats.completed} of ${s.stats.total}</td>
      <td>${s.stats.total ? s.stats.progress + '%' : '—'}</td>
      <td><span class="status-pill ${s.status.cls}">${escapeHtml(s.status.label)}</span></td>
    </tr>
  `).join('') || `<tr><td colspan="5">${emptyText}</td></tr>`;
}

if (user) {
  renderShell('dashboard');

  const totals = overviewTotals(overview);
  document.getElementById('stat-total').textContent = totals.students;
  document.getElementById('stat-outstanding').textContent = totals.outstanding;
  document.getElementById('stat-completed').textContent = totals.completed;
  document.getElementById('stat-average').textContent = totals.averageProgress === null ? '—' : totals.averageProgress + '%';

  // What learners sent this facilitator: shared tasks (work waiting to be
  // marked first) and upcoming support sessions, soonest first.
  const waiting = t => Boolean(t.submission) && !isMarked(t);
  const shared = getAssignedTasks(user.email)
    .filter(t => t.sharedWith === user.email)
    .sort((a, b) => (waiting(b) - waiting(a)) || (parseDate(a.date) - parseDate(b.date)))
    .slice(0, 5);
  document.getElementById('shared-list').innerHTML = shared.map(t => {
    const status = taskStatus(t);
    const url = `review-task.html?student=${encodeURIComponent(t.studentEmail)}&id=${encodeURIComponent(t.id)}`;
    return `<li>
      <span><a href="${escapeHtml(url)}">${escapeHtml(t.title)}</a> <span class="muted">· ${escapeHtml(t.studentName)}</span></span>
      <span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span>
    </li>`;
  }).join('') || '<li><span>No learner has shared a task with you yet.</span></li>';

  const bookings = getFacilitatorBookings(user.email)
    .filter(b => dayDiffFromToday(b.date) >= 0)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);
  document.getElementById('booking-list').innerHTML = bookings.map(b => `<li>
      <span><strong>${escapeHtml(formatDate(b.date))} at ${escapeHtml(b.time)}</strong> <span class="muted">· ${escapeHtml(b.studentName)} · ${escapeHtml(b.topic)}</span></span>
    </li>`).join('') || '<li><span>No upcoming support sessions.</span></li>';

  renderStudents('');
  document.getElementById('search').addEventListener('input', (e) => renderStudents(e.target.value));
}
