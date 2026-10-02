const RESOURCES = [
  { title: 'JavaScript fundamentals guide', type: 'Link', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
  { title: 'Firebase quick-start', type: 'Link', url: 'https://firebase.google.com/docs/web/setup' },
  { title: 'Portfolio checklist', type: 'PDF' },
];

const user = requireAuth();

if (user) {
  renderShell('resources');
  document.getElementById('resource-list').innerHTML = RESOURCES.map(r => `
    <li>
      <span>${r.url
        ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a>`
        : escapeHtml(r.title)}</span>
      <span class="status-pill pending">${escapeHtml(r.type)}</span>
    </li>
  `).join('');
}