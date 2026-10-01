import { registerAccount } from "./auth.js";

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  const errorEl = document.getElementById('error');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  errorEl.textContent = '';

  if (!name || !email || !password) {
    errorEl.textContent = 'Please fill in every field.';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.';
    return;
  }

  submitBtn.disabled = true;
  const result = await registerAccount({ name, email, password, role: 'facilitator' });
  submitBtn.disabled = false;

  if (!result.ok) {
    errorEl.textContent = result.error;
    return;
  }

  window.location.href = 'dashboard-facilitator.html';
});
