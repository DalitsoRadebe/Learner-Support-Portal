const user = getCurrentUser();
if (user) document.getElementById('continue-btn').href = dashboardFor(user);
