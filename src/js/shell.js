const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
  { key: 'tasks', label: 'My Tasks', href: 'tasks.html' },
  { key: 'resources', label: 'Resources', href: 'resources.html' },
  { key: 'progress', label: 'Progress report', href: 'progress.html' },
  { key: 'support', label: 'Support Booking', href: 'support-booking.html' },
  { key: 'game', label: 'Mini game', href: 'mini-game.html' },
];

function renderShell(active) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const dashboardHref = user.role === 'facilitator' ? 'dashboard-facilitator.html' : 'dashboard-learner.html';

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const links = NAV_ITEMS.map(item => {
      const href = item.key === 'dashboard' ? dashboardHref : item.href;
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
      <button class="nav-link logout-link" id="logout-btn">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
  }

  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.innerHTML = `
      <div class="topbar-title">SKILLSTRACK PORTAL</div>
      <a class="topbar-profile" href="profile.html" title="${user.name}">
        <span>Profile</span>
        <span class="avatar"></span>
      </a>
    `;
  }
}