
const user = requireAuth('student');

function renderBookings() {
  const bookings = getBookings(user.email)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  document.getElementById('booking-list').innerHTML = bookings.map(b => {
    const past = dayDiffFromToday(b.date) < 0;
    return `
      <li>
        <span>
          <strong>${escapeHtml(b.topic)}</strong>
          <span class="status-pill ${past ? 'pending' : 'on-track'}">${past ? 'Past' : 'Upcoming'}</span><br />
          <span class="muted">${escapeHtml(formatDate(b.date))} at ${escapeHtml(b.time)}</span>
          ${b.notes ? `<br /><span class="muted">${escapeHtml(b.notes)}</span>` : ''}
        </span>
        <span class="row-actions">
          <button type="button" class="danger" data-id="${escapeHtml(b.id)}">Cancel</button>
        </span>
      </li>`;
  }).join('') || '<li><span>No sessions booked yet.</span></li>';
}

if (user) {
  renderShell('support');

  const dateEl = document.getElementById('date');
  dateEl.min = todayString();
  document.getElementById('topic').innerHTML = TASK_CATEGORIES.map(c => `<option>${escapeHtml(c)}</option>`).join('');

  document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const topic = document.getElementById('topic').value;
    const date = dateEl.value;
    const time = document.getElementById('time').value;
    const notes = document.getElementById('notes').value.trim();
    const errorEl = document.getElementById('error');
    errorEl.textContent = '';

    if (!date || !time) {
      errorEl.textContent = 'Please choose a date and a time.';
      return;
    }
    if (dayDiffFromToday(date) < 0) {
      errorEl.textContent = 'Please choose a date that is today or later.';
      return;
    }
    if (getBookings(user.email).some(b => b.date === date && b.time === time)) {
      errorEl.textContent = 'You already have a session booked at that time.';
      return;
    }

    addBooking(user.email, { topic, date, time, notes });
    e.target.reset();
    renderBookings();
    flashMessage('Support session booked.');
  });

  document.getElementById('booking-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn || !confirm('Cancel this booking?')) return;
    deleteBooking(user.email, btn.dataset.id);
    renderBookings();
  });

  renderBookings();
}