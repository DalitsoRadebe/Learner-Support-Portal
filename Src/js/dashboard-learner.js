<<<<<<< HEAD
import "./cloud.js";

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
      <span><a href="task-view.html?id=${encodeURIComponent(t.id)}">${escapeHtml(t.title)}</a> <span class="muted">· due ${escapeHtml(formatDate(t.date))}</span></span>
      <span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span>
    </li>`;
  }).join('') || '<li><span>No tasks yet — your facilitator has not sent you any.</span></li>';
=======
// ---------- Task Class ----------
// Represents an individual task belonging to a learner.

class LearnerTask {
  constructor(task) {
    this.id = task.id;
    this.title = task.title;
    this.date = task.date;
    this.completed = task.completed;
  }

  // Returns the existing task status from storage.js.
  getStatus() {
    return taskStatus(this);
  }

  // Creates the HTML for a single recent task.
  renderItem() {
    const status = this.getStatus();

    return `
      <li>
        <span>${escapeHtml(this.title)} <span class="muted">· due ${escapeHtml(formatDate(this.date))}</span></span>
        <span class="status-pill ${status.cls}">${status.label}</span>
      </li>
    `;
  }
}

// ---------- Learner Dashboard Class ----------
// Manages the learner's dashboard and its task objects.

class LearnerDashboard {
  constructor(user) {
    this.user = user;
    this.tasks = [];
    this.stats = null;
  }

  // Initializes the dashboard.
  init() {
    renderShell('dashboard');

    this.renderGreeting();
    this.loadTasks();
    this.renderStats();
    this.renderRecentTasks();
  }

  // Displays the learner's first name.
  renderGreeting() {
    const firstName = this.user.name.split(' ')[0];

    document.getElementById('greeting').textContent =
      `Welcome, ${firstName}`;
  }

  // Retrieves tasks and converts them into LearnerTask objects.
  loadTasks() {
    const storedTasks = getTasks(this.user.email);

    this.tasks = storedTasks.map(task => new LearnerTask(task));
    this.stats = taskStats(storedTasks);
  }

  // Displays the same statistics as the original dashboard.
  renderStats() {
    document.getElementById('stat-outstanding').textContent =
      this.stats.outstanding;

    document.getElementById('stat-completed').textContent =
      this.stats.completed;

    document.getElementById('stat-all').textContent =
      this.stats.total;

    document.getElementById('stat-progress').textContent =
      this.stats.progress + '%';
  }

  // Displays the five most recent tasks using the original sorting rules.
  renderRecentTasks() {
    const recentTasks = [...this.tasks]
      .sort((a, b) =>
        (a.completed - b.completed) ||
        (parseDate(a.date) - parseDate(b.date))
      )
      .slice(0, 5);

    const recentList = document.getElementById('recent-list');

    recentList.innerHTML =
      recentTasks.map(task => task.renderItem()).join('') ||
      '<li><span>No tasks yet — your facilitator has not sent you any.</span></li>';
  }
}

// ---------- Start Learner Dashboard ----------

const user = auth('student');

if (user) {
  const dashboard = new LearnerDashboard(user);
  dashboard.init();
>>>>>>> 7f7d19d161b4d024c41f06d06df9a656f5f89086
}
