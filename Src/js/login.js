import { loginAccount } from "./auth.js";

const existing = getCurrentUser();
if (existing) window.location.href = dashboardFor(existing);

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Please enter your email and password.';
    return;
  }

  submitBtn.disabled = true;
  const result = await loginAccount(email, password);
  submitBtn.disabled = false;

  if (!result.ok) {
    errorEl.textContent = result.error;
    return;
  }
  window.location.href = dashboardFor(result.user);
});
