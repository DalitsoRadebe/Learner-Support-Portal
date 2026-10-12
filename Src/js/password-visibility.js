document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const toggle = event.target.closest('[data-password-toggle]');
  if (!toggle) return;

  const input = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!(input instanceof HTMLInputElement)) return;

  const showPassword = input.type === 'password';
  const label = showPassword ? 'Hide password' : 'Show password';
  input.type = showPassword ? 'text' : 'password';
  toggle.setAttribute('aria-pressed', String(showPassword));
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
});