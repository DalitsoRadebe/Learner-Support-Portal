import "./cloud.js";

// A facilitator sees the support sessions learners booked with them, and the
// ones they booked for learners (from review-task.html), and can cancel them.

const user = requireAuth('facilitator');

function render() {
  const filter = document.getElementById('filter').value;
  let sessions = getFacilitatorBookings(user.email);
  if (filter === 'upcoming') sessions = sessions.filter(b => dayDiffFromToday(b.date) >= 0);
  if (filter === 'past') sessions = sessions.filter(b => dayDiffFromToday(b.date) < 0);
  sessions.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  if (filter === 'past') sessions.reverse();

  document.getElementById('session-rows').innerHTML = sessions.map(b => `
    <tr>
      <td>${escapeHtml(formatDate(b.date))} at ${escapeHtml(b.time)}</td>
      <td>${escapeHtml(b.studentName)}</td>
      <td>${escapeHtml(b.topic)}${b.notes ? `<div class="muted">${escapeHtml(b.notes)}</div>` : ''}</td>
      <td>${b.bookedBy === user.email ? 'You' : 'The learner'}</td>
      <td>
        <div class="row-actions">
          <button type="button" class="danger" data-id="${escapeHtml(b.id)}" data-student="${escapeHtml(b.studentEmail)}">Cancel</button>
        </div>
      </td>
    </tr>`).join('') || `<tr><td colspan="5">${filter === 'past' ? 'No past sessions.' : 'No sessions booked yet.'}</td></tr>`;
}

if (user) {
  renderShell('sessions');
  render();

  document.getElementById('filter').addEventListener('input', render);

  document.getElementById('session-rows').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn || !confirm('Cancel this support session? The learner will no longer see it.')) return;
    deleteBooking(btn.dataset.student, btn.dataset.id);
    render();
  });
}
