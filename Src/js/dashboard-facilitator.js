const user = requireAuth('facilitator');

function renderStudents(filter) {
  const term = filter.trim().toLowerCase();
  const rows = FACILITATOR_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(term) || s.class.toLowerCase().includes(term)
  );
  document.getElementById('student-rows').innerHTML = rows.map(s => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.class)}</td>
      <td>${s.completedTasks}</td>
      <td>${s.progress}%</td>
      <td><span class="status-pill ${s.status === 'On Track' ? 'on-track' : 'needs-attention'}">${escapeHtml(s.status)}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="5">No students match your search.</td></tr>';
}

if (user) {
  renderShell('dashboard');

  document.getElementById('stat-total').textContent = FACILITATOR_STATS.totalStudents;
  document.getElementById('stat-outstanding').textContent = FACILITATOR_STATS.outstandingTasks;
  document.getElementById('stat-completed').textContent = FACILITATOR_STATS.completedTasks;
  document.getElementById('stat-average').textContent = FACILITATOR_STATS.averageProgress + '%';

  renderStudents('');
  document.getElementById('search').addEventListener('input', (e) => renderStudents(e.target.value));
}
