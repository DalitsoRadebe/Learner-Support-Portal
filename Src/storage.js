const DB = {
  USERS: 'st_users',
  SESSION: 'st_session',
  TASKS_PREFIX: 'st_tasks_',
  BOOKINGS_PREFIX: 'st_bookings_',
  QUIZ_PREFIX: 'st_quiz_',
};

const TASK_CATEGORIES = ['Javascript', 'Firebase', 'Documentation', 'HTML/CSS', 'Other'];

const DEFAULT_SETTINGS = {
  notifications: { email: true, reminders: true },
  privacy: { visibility: 'Only me', activeStatus: false },
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- Generic helpers ----------

// Use on anything user-typed before putting it into innerHTML.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

// Parses a "YYYY-MM-DD" value as local midnight (new Date(str) would treat it
// as UTC and can land on the wrong day).
function parseDate(dateStr) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || '');
  if (!match) return new Date(NaN);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function todayString() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayDiffFromToday(dateStr) {
  return Math.round((parseDate(dateStr) - parseDate(todayString())) / 86400000);
}

function formatDate(dateStr) {
  const d = parseDate(dateStr);
  if (isNaN(d)) return dateStr || '';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------- Users / auth ----------

function getUsers() {
  return readJSON(DB.USERS, []);
}

function saveUsers(users) {
  writeJSON(DB.USERS, users);
}

function findUser(email) {
  const wanted = String(email).trim().toLowerCase();
  return getUsers().find(u => u.email.toLowerCase() === wanted);
}

function registerUser({ name, email, password, role }) {
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: 'That email address looks invalid.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password should be at least 6 characters.' };
  }
  if (findUser(email)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  const users = getUsers();
  users.push({ name, email, password, role, settings: DEFAULT_SETTINGS });
  saveUsers(users);
  return { ok: true };
}

function login(email, password) {
  const user = findUser(email);
  if (!user || user.password !== password) return null;
  localStorage.setItem(DB.SESSION, user.email);
  return user;
}

// Accounts live only in this browser, so there is no email to send a reset
// link to — the forgot-password page sets the new password directly.
function resetPassword(email, newPassword) {
  const user = findUser(email);
  if (!user) {
    return { ok: false, error: 'No account with that email was found in this browser.' };
  }
  if (newPassword.length < 6) {
    return { ok: false, error: 'Password should be at least 6 characters.' };
  }
  const users = getUsers();
  const idx = users.findIndex(u => u.email === user.email);
  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);
  return { ok: true };
}

function getCurrentUser() {
  const email = localStorage.getItem(DB.SESSION);
  if (!email) return null;
  return findUser(email) || null;
}

function updateCurrentUser(patch) {
  const user = getCurrentUser();
  if (!user) return null;
  const users = getUsers();
  const idx = users.findIndex(u => u.email === user.email);
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

function getSettings(user) {
  const saved = (user && user.settings) || {};
  return {
    notifications: { ...DEFAULT_SETTINGS.notifications, ...saved.notifications },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...saved.privacy },
  };
}

function logout() {
  localStorage.removeItem(DB.SESSION);
  window.location.href = 'login.html';
}

function dashboardFor(user) {
  return user.role === 'facilitator' ? 'dashboard-facilitator.html' : 'dashboard-learner.html';
}

// Redirects to login if no session; if `role` is given, redirects users of
// the wrong role to their own dashboard instead of the page they asked for.
// Returns the user, or null when a redirect is under way.
function requireAuth(role) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = dashboardFor(user);
    return null;
  }
  return user;
}

// ---------- Tasks (learners) ----------

function getTasks(email) {
  return readJSON(DB.TASKS_PREFIX + email, []);
}

function saveTasks(email, tasks) {
  writeJSON(DB.TASKS_PREFIX + email, tasks);
}

function addTask(email, task) {
  const tasks = getTasks(email);
  tasks.push({ id: newId(), completed: false, ...task });
  saveTasks(email, tasks);
}

function updateTask(email, id, patch) {
  const tasks = getTasks(email);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx] = { ...tasks[idx], ...patch };
  saveTasks(email, tasks);
}

function deleteTask(email, id) {
  saveTasks(email, getTasks(email).filter(t => t.id !== id));
}

function isOverdue(task) {
  return !task.completed && dayDiffFromToday(task.date) < 0;
}

function taskStatus(task) {
  if (task.completed) return { label: 'Completed', cls: 'on-track' };
  const diff = dayDiffFromToday(task.date);
  if (diff < 0) return { label: 'Overdue', cls: 'overdue' };
  if (diff <= 3) return { label: 'Due Soon', cls: 'due-soon' };
  return { label: 'Pending', cls: 'pending' };
}

function taskStats(tasks) {
  const completed = tasks.filter(t => t.completed).length;
  return {
    total: tasks.length,
    completed,
    outstanding: tasks.length - completed,
    overdue: tasks.filter(isOverdue).length,
    progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

// ---------- Assigned tasks (facilitators) ----------

function getStudents() {
  return getUsers().filter(u => u.role === 'student');
}

// Assigned tasks go into the learner's own task list, so they show up in
// My Tasks; `assignedBy` marks who sent them.
function assignTask(facilitator, students, task) {
  students.forEach(s => addTask(s.email, {
    ...task,
    assignedBy: facilitator.email,
    assignedByName: facilitator.name,
  }));
}

function getAssignedTasks(facilitatorEmail) {
  return getStudents().flatMap(s => getTasks(s.email)
    .filter(t => t.assignedBy === facilitatorEmail)
    .map(t => ({ ...t, studentName: s.name, studentEmail: s.email })));
}

// ---------- Support bookings ----------

function getBookings(email) {
  return readJSON(DB.BOOKINGS_PREFIX + email, []);
}

function addBooking(email, booking) {
  const bookings = getBookings(email);
  bookings.push({ id: newId(), createdAt: new Date().toISOString(), ...booking });
  writeJSON(DB.BOOKINGS_PREFIX + email, bookings);
}

function deleteBooking(email, id) {
  writeJSON(DB.BOOKINGS_PREFIX + email, getBookings(email).filter(b => b.id !== id));
}

// ---------- Mini game score (best score so far) ----------

function getQuizScore(email) {
  return readJSON(DB.QUIZ_PREFIX + email, 0);
}

function setQuizScore(email, score) {
  writeJSON(DB.QUIZ_PREFIX + email, score);
}

// ---------- Facilitator mock roster ----------
// Demo data shown on the facilitator dashboard's student overview table.

const FACILITATOR_STATS = { totalStudents: 48, outstandingTasks: 63, completedTasks: 152, averageProgress: 72 };

const FACILITATOR_STUDENTS = [
  { name: 'John Radebe', class: 'Grade 12A', completedTasks: 12, progress: 65, status: 'On Track' },
  { name: 'Natasha Ledwaba', class: 'Grade 12B', completedTasks: 14, progress: 58, status: 'Needs Attention' },
  { name: 'Refilwe Mashego', class: 'Grade 12C', completedTasks: 18, progress: 80, status: 'On Track' },
  { name: 'Hope Moshia', class: 'Grade 12D', completedTasks: 10, progress: 45, status: 'Needs Attention' },
  { name: 'Taboa Mhlongo', class: 'Grade 12A', completedTasks: 20, progress: 90, status: 'On Track' },
];
