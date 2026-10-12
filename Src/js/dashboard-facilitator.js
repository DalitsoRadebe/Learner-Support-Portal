<<<<<<< HEAD
import "./cloud.js";

const user = requireAuth('facilitator');

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
=======
// ---------- Student Class ----------
// Represents a student and their dashboard information.

class Student {
  constructor({ name, class: studentClass, completedTasks, progress, status }) {
    this.name = name;
    this.class = studentClass;
    this.completedTasks = completedTasks;
    this.progress = progress;
    this.status = status;
  }

  matchesSearch(term) {
    return (
      this.name.toLowerCase().includes(term) ||
      this.class.toLowerCase().includes(term)
    );
  }

  renderRow() {
    const statusClass =
      this.status === 'On Track' ? 'on-track' : 'needs-attention';

    return `
      <tr>
        <td>${escapeHtml(this.name)}</td>
        <td>${escapeHtml(this.class)}</td>
        <td>${this.completedTasks}</td>
        <td>${this.progress}%</td>
        <td>
          <span class="status-pill ${statusClass}">
            ${escapeHtml(this.status)}
          </span>
        </td>
      </tr>
    `;
  }
>>>>>>> 7f7d19d161b4d024c41f06d06df9a656f5f89086
}

// ---------- Facilitator Dashboard Class ----------
// Manages the dashboard, statistics, students, and search.

class FacilitatorDashboard {
  constructor(user, students, stats) {
    this.user = user;
    this.students = students.map(student => new Student(student));
    this.stats = stats;
    this.searchInput = document.getElementById('search');
    this.studentRows = document.getElementById('student-rows');
  }

  // Displays the dashboard layout and navigation.
  init() {
    renderShell('dashboard');

    this.renderStats();
    this.renderStudents('');

    this.searchInput.addEventListener('input', event => {
      this.renderStudents(event.target.value);
    });
  }

  // Displays the existing dashboard statistics.
  renderStats() {
    document.getElementById('stat-total').textContent =
      this.stats.totalStudents;

    document.getElementById('stat-outstanding').textContent =
      this.stats.outstandingTasks;

    document.getElementById('stat-completed').textContent =
      this.stats.completedTasks;

    document.getElementById('stat-average').textContent =
      this.stats.averageProgress + '%';
  }

  // Filters students by name or class and displays the results.
  renderStudents(filter) {
    const term = filter.trim().toLowerCase();

    const matchingStudents = this.students.filter(student =>
      student.matchesSearch(term)
    );

    this.studentRows.innerHTML =
      matchingStudents.map(student => student.renderRow()).join('') ||
      '<tr><td colspan="5">No students match your search.</td></tr>';
  }
}

// ---------- Start Dashboard ----------

const user = auth('facilitator');

if (user) {
  const dashboard = new FacilitatorDashboard(
    user,
    FACILITATOR_STUDENTS,
    FACILITATOR_STATS
  );

<<<<<<< HEAD
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
=======
  dashboard.init();
>>>>>>> 7f7d19d161b4d024c41f06d06df9a656f5f89086
}
