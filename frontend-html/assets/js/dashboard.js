// =========================================
// DASHBOARD LOGIC: Route guard + tampilkan profil + logout
// =========================================
(async function () {
  const loadingScreen = document.getElementById('loading-screen');
  const content = document.getElementById('dashboard-content');

  // ---------- ROUTE GUARD ----------
  // Backend tetap sumber kebenaran utama (middleware requireAuth di server).
  // Di sini kita hanya mencegah kedipan konten sebelum sesi terverifikasi.
  try {
    await Api.refreshAccessToken();
    const me = await Api.get('/auth/me');
    renderUser(me.data);
  } catch (e) {
    window.location.href = 'index.html';
    return;
  }

  loadingScreen.style.display = 'none';
  content.style.display = 'block';

  function renderUser(user) {
    document.getElementById('user-avatar').src =
      user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`;
    document.getElementById('user-fullname').textContent = user.fullName;
    document.getElementById('user-username').textContent = `@${user.username}`;
    document.getElementById('info-email').textContent = user.email;
    document.getElementById('info-provider').textContent = user.provider;
    document.getElementById('info-role').textContent = user.role;
    document.getElementById('info-status').textContent = user.status;
    document.getElementById('info-created').textContent = new Date(user.createdAt).toLocaleDateString('id-ID');
    document.getElementById('info-lastlogin').textContent = new Date(user.lastLogin).toLocaleString('id-ID');
  }

  // ---------- THEME TOGGLE ----------
  initTheme();
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // ---------- LOGOUT ----------
  document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
      await Api.post('/auth/logout');
    } finally {
      Api.setAccessToken(null);
      sessionStorage.removeItem('currentUser');
      showToast('Anda telah keluar.', 'success');
      setTimeout(() => (window.location.href = 'index.html'), 500);
    }
  });
})();
