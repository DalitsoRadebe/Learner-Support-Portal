const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', roles: ['student', 'facilitator'] },
  { key: 'tasks', label: 'My Tasks', href: 'tasks.html', roles: ['student'] },
  { key: 'assign', label: 'Assign Tasks', href: 'assign-task.html', roles: ['facilitator'] },
  { key: 'resources', label: 'Resources', href: 'resources.html', roles: ['student', 'facilitator'] },
  { key: 'progress', label: 'Progress report', href: 'progress.html', roles: ['student'] },
  { key: 'support', label: 'Support Booking', href: 'support-booking.html', roles: ['student'] },
  { key: 'sessions', label: 'Support Sessions', href: 'support-sessions.html', roles: ['facilitator'] },
  { key: 'game', label: 'Mini game', href: 'mini-game.html', roles: ['student'] },
];

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join('');
}

// The user's profile picture if they have one, otherwise their initials.
function avatarHtml(user) {
  if (user.photo && user.photo.startsWith('data:image/')) {
    return `<img src="${escapeHtml(user.photo)}" alt="" />`;
  }
  return escapeHtml(initials(user.name));
}

function renderShell(active) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const links = NAV_ITEMS.filter(item => item.roles.includes(user.role)).map(item => {
      const href = item.key === 'dashboard' ? dashboardFor(user) : item.href;
      const isActive = item.key === active;
      return `<a class="nav-link${isActive ? ' active' : ''}" href="${href}">${item.label}</a>`;
    }).join('');

    sidebar.innerHTML = `
      <div class="logo">
        <span class="logo-mark">S</span>
        <div>
          <div class="logo-name">SkillsTrack</div>
          <div class="logo-tag">LEARN. PRACTICE. GROW.</div>
        </div>
      </div>
      <nav class="nav">${links}</nav>
      <button class="nav-link logout-link" id="logout-btn" type="button">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
  }

  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.innerHTML = `
      <div class="topbar-title">SKILLSTRACK PORTAL</div>
      <a class="topbar-profile" href="profile.html" title="${escapeHtml(user.name)}">
        <span>Profile</span>
        <span class="avatar">${avatarHtml(user)}</span>
      </a>
    `;
  }
}

// A button that downloads an attached file. `file` is the record kept on a
// task: { fileId, name, size }. cloud.js handles the click.
function fileButtonHtml(file) {
  return `<button type="button" class="btn file-btn" data-file-id="${escapeHtml(file.fileId)}">`
    + `Download ${escapeHtml(file.name)} <span class="muted">(${formatSize(file.size)})</span></button>`;
}

// Small message that fades out by itself. `kind` is 'success' or 'error'.
function flashMessage(text, kind = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `form-message ${kind} toast`;
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(flashMessage.timer);
  flashMessage.timer = setTimeout(() => { toast.hidden = true; }, kind === 'error' ? 6000 : 2500);
}
