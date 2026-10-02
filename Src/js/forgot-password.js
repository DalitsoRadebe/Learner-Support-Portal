import { sendResetLink } from "./auth.js";

const message = document.getElementById('message');

function show(text, kind) {
  message.hidden = false;
  message.className = 'form-message ' + kind;
  message.textContent = text;
}

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!email) {
    show('Please enter your email address.', 'error');
    return;
  }

  submitBtn.disabled = true;
  const result = await sendResetLink(email);
  submitBtn.disabled = false;

  if (!result.ok) {
    show(result.error, 'error');
    return;
  }
  show('If an account exists for this email, a reset link has been sent. Check your inbox and your spam folder.', 'success');
});
