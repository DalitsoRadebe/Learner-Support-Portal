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

  dashboard.init();
}
