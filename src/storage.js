const DB = {
  USERS: 'st_users',
  SESSION: 'st_session',
  TASKS_PREFIX: 'st_tasks_',
  BOOKINGS_PREFIX: 'st_bookings_',
  QUIZ_PREFIX: 'st_quiz_',
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

// ---------- Users / auth ----------

function getUsers() {
  return readJSON(DB.USERS, []);
}

function saveUsers(users) {
  writeJSON(DB.USERS, users);
}

function findUser(email) {
  return getUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
}

function registerUser({ name, email, password, role }) {
  if (findUser(email)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  const users = getUsers();
  users.push({ name, email, password, role });
  saveUsers(users);
  return { ok: true };
}

function login(email, password) {
  const user = findUser(email);
  if (!user || user.password !== password) return null;
  localStorage.setItem(DB.SESSION, user.email);
  return user;
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

function logout() {
  localStorage.removeItem(DB.SESSION);
  window.location.href = 'login.html';
}

// Redirects to login if no session; if `role` is given, redirects users of
// the wrong role to their own dashboard instead of the page they asked for.
function requireAuth(role) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = user.role === 'facilitator' ? 'dashboard-facilitator.html' : 'dashboard-learner.html';
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
  tasks.push({ id: Date.now().toString(36), completed: false, ...task });
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

// ---------- Support bookings ----------

function getBookings(email) {
  return readJSON(DB.BOOKINGS_PREFIX + email, []);
}

function addBooking(email, booking) {
  const bookings = getBookings(email);
  bookings.push({ id: Date.now().toString(36), createdAt: new Date().toISOString(), ...booking });
  writeJSON(DB.BOOKINGS_PREFIX + email, bookings);
}

// ---------- Mini game score ----------

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
