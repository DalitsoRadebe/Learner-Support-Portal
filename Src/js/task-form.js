// Learners no longer create or edit tasks — only facilitators assign them.
// Anyone who opens this page is sent to the right place instead.
const user = requireAuth();

if (user) {
  window.location.replace(user.role === 'facilitator' ? 'assign-task.html' : 'tasks.html');
}
