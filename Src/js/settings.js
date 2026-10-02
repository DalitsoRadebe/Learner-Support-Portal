import { changePassword } from "./auth.js";

const user = requireAuth();

if (user) {
  renderShell('');

  document.getElementById('settings-avatar').innerHTML = avatarHtml(user);
  document.getElementById('settings-username').textContent = user.name;
  document.getElementById('settings-role').textContent = user.role === 'facilitator' ? 'Facilitator' : 'Learner';

  const settings = getSettings(user);
  const emailToggle = document.getElementById('toggle-email');
  const remindersToggle = document.getElementById('toggle-reminders');
  const visibilitySelect = document.getElementById('visibility');
  const activeToggle = document.getElementById('toggle-active');

  emailToggle.checked = settings.notifications.email;
  remindersToggle.checked = settings.notifications.reminders;
  visibilitySelect.value = settings.privacy.visibility;
  activeToggle.checked = settings.privacy.activeStatus;

  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = document.getElementById('current-password').value;
    const next = document.getElementById('new-password').value;
    const confirmed = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('password-error');
    errorEl.textContent = '';

    if (!current) {
      errorEl.textContent = 'Please enter your current password.';
      return;
    }
    if (next.length < 6) {
      errorEl.textContent = 'New password should be at least 6 characters.';
      return;
    }
    if (next !== confirmed) {
      errorEl.textContent = 'New passwords do not match.';
      return;
    }
    // The password is kept by Firebase, which also checks the current one.
    const result = await changePassword(user.email, current, next);
    if (!result.ok) {
      errorEl.textContent = result.error;
      return;
    }
    e.target.reset();
    flashMessage('Password updated successfully.');
  });

  document.getElementById('notifications-form').addEventListener('submit', (e) => {
    e.preventDefault();
    settings.notifications = { email: emailToggle.checked, reminders: remindersToggle.checked };
    updateCurrentUser({ settings });
    flashMessage('Notification settings saved.');
  });

  document.getElementById('privacy-form').addEventListener('submit', (e) => {
    e.preventDefault();
    settings.privacy = { visibility: visibilitySelect.value, activeStatus: activeToggle.checked };
    updateCurrentUser({ settings });
    flashMessage('Privacy settings saved.');
  });

  if (window.location.hash === '#password') {
    document.getElementById('password').scrollIntoView({ behavior: 'smooth' });
  }
}
