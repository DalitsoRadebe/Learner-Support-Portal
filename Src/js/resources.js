import "./cloud.js";

// Everyone sees the resources; facilitators can also add links and upload
// files, and remove the ones they added.

const BUILT_IN = [
  { id: 'built-in-js', title: 'JavaScript fundamentals guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
  { id: 'built-in-firebase', title: 'Firebase quick-start', url: 'https://firebase.google.com/docs/web/setup' },
];

const user = requireAuth();

// Only web addresses are allowed, so a link cannot run code when clicked.
function isWebUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch (e) {
    return false;
  }
}

function renderResources() {
  const added = getResources().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  document.getElementById('resource-list').innerHTML = [...added, ...BUILT_IN].map(r => {
    const title = r.url && isWebUrl(r.url)
      ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a>`
      : `<strong>${escapeHtml(r.title)}</strong>`;
    const remove = r.createdBy === user.email
      ? `<button type="button" class="danger" data-id="${escapeHtml(r.id)}">Delete</button>`
      : '';
    return `
      <li>
        <span>
          ${title}
          ${r.description ? `<br /><span class="muted">${escapeHtml(r.description)}</span>` : ''}
          ${r.createdByName ? `<br /><span class="muted">Added by ${escapeHtml(r.createdByName)} on ${escapeHtml(formatDate(r.createdAt))}</span>` : ''}
          ${r.file ? `<br />${fileButtonHtml(r.file)}` : ''}
        </span>
        <span class="row-actions">
          <span class="status-pill pending">${r.file ? 'File' : 'Link'}</span>
          ${remove}
        </span>
      </li>`;
  }).join('');
}

function setupForm() {
  const form = document.getElementById('resource-form');
  const kindEl = document.getElementById('kind');
  const fileEl = document.getElementById('file');
  const urlEl = document.getElementById('url');
  const addBtn = document.getElementById('add-btn');
  const errorEl = document.getElementById('error');

  form.hidden = false;
  document.getElementById('file-hint').textContent = `One file, up to ${formatSize(MAX_FILE_BYTES)}.`;

  const showKind = () => {
    document.getElementById('file-field').hidden = kindEl.value !== 'file';
    document.getElementById('url-field').hidden = kindEl.value !== 'link';
  };
  kindEl.addEventListener('input', showKind);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const file = fileEl.files[0];
    const url = urlEl.value.trim();
    errorEl.textContent = '';

    if (!title) {
      errorEl.textContent = 'Please give the resource a title.';
      return;
    }
    if (kindEl.value === 'file' && !file) {
      errorEl.textContent = 'Please choose a file to upload.';
      return;
    }
    if (kindEl.value === 'file' && file.size > MAX_FILE_BYTES) {
      errorEl.textContent = `That file is too big. Please choose one under ${formatSize(MAX_FILE_BYTES)}.`;
      return;
    }
    if (kindEl.value === 'link' && !isWebUrl(url)) {
      errorEl.textContent = 'Please enter a full web address starting with https://';
      return;
    }

    const resource = { title, description, createdBy: user.email, createdByName: user.name };
    addBtn.disabled = true;
    try {
      if (kindEl.value === 'file') {
        addBtn.textContent = 'UPLOADING…';
        resource.file = await window.cloud.uploadFile(file, [], true);
      } else {
        resource.url = url;
      }
      addBtn.textContent = 'SAVING…';
      await addResource(resource);
    } catch (error) {
      console.error(error);
      errorEl.textContent = 'The file could not be uploaded, so the resource was not added. Please try again.';
      return;
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = 'ADD RESOURCE';
    }

    form.reset();
    showKind();
    renderResources();
    flashMessage('Resource added. Everyone can see it now.');
  });
}

if (user) {
  renderShell('resources');
  renderResources();
  if (user.role === 'facilitator') setupForm();

  document.getElementById('resource-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn || !confirm('Delete this resource? Nobody will see it any more.')) return;
    deleteResource(btn.dataset.id);
    renderResources();
  });
}
