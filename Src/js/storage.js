const DB = {
  USERS: 'st_users',
  SESSION: 'st_session',
  TASKS_PREFIX: 'st_tasks_',
  BOOKINGS_PREFIX: 'st_bookings_',
  QUIZ_PREFIX: 'st_quiz_',
  RESOURCES: 'st_resources',
};

const TASK_CATEGORIES = ['Javascript', 'Firebase', 'Documentation', 'HTML/CSS', 'Other'];

// Attached files are stored inside a Firestore document, which cannot be
// larger than 1 MB, so files are kept well under that.
const MAX_FILE_BYTES = 700 * 1024;

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

// Everything below is saved in this browser first, then copied to Firestore
// by cloud.js, which every signed-in page loads. Returns a promise that
// settles once Firestore has the change (pages usually do not wait for it).
function cloudSave(method, ...args) {
  return window.cloud ? window.cloud[method](...args) : Promise.resolve();
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

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

// Passwords are only ever reset by the email link Firebase sends
// (forgot-password.html, sendResetLink in auth.js).

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
  cloudSave('saveProfile', patch);
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
  const toLogin = () => { window.location.href = 'login.html'; };
  if (window.cloud) window.cloud.signOut().then(toLogin, toLogin);
  else toLogin();
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
  const saved = { id: newId(), completed: false, ...task };
  tasks.push(saved);
  saveTasks(email, tasks);
  return cloudSave('saveTask', email, saved);
}

function updateTask(email, id, patch) {
  const tasks = getTasks(email);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx] = { ...tasks[idx], ...patch };
  saveTasks(email, tasks);
  cloudSave('updateTask', id, patch);
}

function deleteTask(email, id) {
  saveTasks(email, getTasks(email).filter(t => t.id !== id));
  cloudSave('deleteTask', id);
}

function isOverdue(task) {
  return !task.completed && dayDiffFromToday(task.date) < 0;
}

// A facilitator who sees the task: the one who sent it, or the one a learner
// shared their own task with (`sharedWith`). Null for a private task.
function reviewerOf(task) {
  if (task.assignedBy) return { email: task.assignedBy, name: task.assignedByName, uid: task.assignedByUid };
  if (task.sharedWith) return { email: task.sharedWith, name: task.sharedWithName, uid: task.sharedWithUid };
  return null;
}

function isMarked(task) {
  return task.mark !== undefined && task.mark !== null;
}

function taskStatus(task) {
  if (isMarked(task)) return { label: `Marked: ${task.mark}%`, cls: 'on-track' };
  if (task.submission) return { label: 'Submitted', cls: 'due-soon' };
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

function getFacilitators() {
  return getUsers().filter(u => u.role === 'facilitator');
}

// Tasks this facilitator sent, plus learners' own tasks shared with them.
function getAssignedTasks(facilitatorEmail) {
  return getStudents().flatMap(s => getTasks(s.email)
    .filter(t => t.assignedBy === facilitatorEmail || t.sharedWith === facilitatorEmail)
    .map(t => ({ ...t, studentName: s.name, studentEmail: s.email })));
}

// ---------- Support bookings ----------
// A learner books their own sessions, with a facilitator of their choice
// (`bookedWith`, `bookedWithName`, `bookedWithUid`). A facilitator can also
// book one for a learner; `bookedBy` then holds the facilitator's email.

function getBookings(email) {
  return readJSON(DB.BOOKINGS_PREFIX + email, []);
}

function addBooking(email, booking) {
  const bookings = getBookings(email);
  const saved = { id: newId(), createdAt: new Date().toISOString(), ...booking };
  bookings.push(saved);
  writeJSON(DB.BOOKINGS_PREFIX + email, bookings);
  cloudSave('saveBooking', email, saved);
}

// Sessions a learner booked with this facilitator (`bookedWith`) and sessions
// this facilitator booked for a learner, across all learners.
function getFacilitatorBookings(facilitatorEmail) {
  return getStudents().flatMap(s => getBookings(s.email)
    .filter(b => b.bookedWith === facilitatorEmail || b.bookedBy === facilitatorEmail)
    .map(b => ({ ...b, studentName: s.name, studentEmail: s.email })));
}

function deleteBooking(email, id) {
  writeJSON(DB.BOOKINGS_PREFIX + email, getBookings(email).filter(b => b.id !== id));
  cloudSave('deleteBooking', id);
}

// ---------- Mini game score (best score so far) ----------

function getQuizScore(email) {
  return readJSON(DB.QUIZ_PREFIX + email, 0);
}

function setQuizScore(email, score) {
  writeJSON(DB.QUIZ_PREFIX + email, score);
  cloudSave('saveProfile', { quizScore: score });
}

// ---------- Facilitator overview ----------
// Every registered learner, with their progress on the tasks this facilitator
// can see: the ones they sent and the ones the learner shared with them.
// Learners' private tasks are not visible to facilitators, so they are not
// counted.

function studentOverview(facilitatorEmail) {
  return getStudents().map(s => {
    const tasks = getTasks(s.email)
      .filter(t => t.assignedBy === facilitatorEmail || t.sharedWith === facilitatorEmail);
    const stats = taskStats(tasks);
    const status = !stats.total ? { label: 'No tasks yet', cls: 'pending' }
      : stats.overdue ? { label: 'Needs Attention', cls: 'needs-attention' }
      : { label: 'On Track', cls: 'on-track' };
    return { name: s.name, email: s.email, stats, status };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

// Totals across all learners. The average only counts learners who have at
// least one task, so learners with nothing to do do not pull it down to 0%.
function overviewTotals(overview) {
  const withTasks = overview.filter(s => s.stats.total);
  return {
    students: overview.length,
    outstanding: overview.reduce((sum, s) => sum + s.stats.outstanding, 0),
    completed: overview.reduce((sum, s) => sum + s.stats.completed, 0),
    averageProgress: withTasks.length
      ? Math.round(withTasks.reduce((sum, s) => sum + s.stats.progress, 0) / withTasks.length)
      : null,
  };
}

// ---------- Resources ----------
// Links and files facilitators share with everyone. A resource has either a
// `url` or a `file` ({ fileId, name, type, size }, see cloud.uploadFile).

function getResources() {
  return readJSON(DB.RESOURCES, []);
}

function addResource(resource) {
  const saved = { id: newId(), createdAt: new Date().toISOString(), ...resource };
  writeJSON(DB.RESOURCES, [...getResources(), saved]);
  return cloudSave('saveResource', saved);
}

function deleteResource(id) {
  writeJSON(DB.RESOURCES, getResources().filter(r => r.id !== id));
  cloudSave('deleteResource', id);
}
