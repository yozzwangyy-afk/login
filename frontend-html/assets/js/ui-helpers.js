// =========================================
// UI HELPERS: Snackbar (toast), Error Dialog, Theme Toggle
// =========================================

// ---------- SNACKBAR / TOAST ----------
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ---------- ERROR DIALOG ----------
// Peta seluruh skenario error yang diminta requirement
const ERROR_MESSAGES = {
  USER_CANCELLED: 'Login dibatalkan. Silakan coba lagi jika ingin melanjutkan.',
  NO_INTERNET: 'Tidak ada koneksi internet. Periksa jaringan Anda.',
  TOKEN_EXPIRED: 'Sesi Anda telah kedaluwarsa. Silakan login kembali.',
  ACCOUNT_DISABLED: 'Akun ini telah dinonaktifkan. Hubungi dukungan untuk bantuan.',
  SERVER_ERROR: 'Terjadi gangguan pada server. Coba lagi beberapa saat lagi.',
  LOGIN_FAILED: 'Login gagal. Pastikan Anda memilih akun yang benar.',
  PROVIDER_UNAVAILABLE: 'Layanan login ini sedang tidak tersedia saat ini.',
  TOO_MANY_ATTEMPTS: 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.',
  SESSION_EXPIRED: 'Sesi berakhir. Silakan login kembali.',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.',
};

function showErrorDialog(code) {
  const overlay = document.getElementById('error-overlay');
  const messageEl = document.getElementById('error-message');
  if (!overlay || !messageEl) return;
  messageEl.textContent = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  overlay.classList.add('visible');
}

function hideErrorDialog() {
  const overlay = document.getElementById('error-overlay');
  if (overlay) overlay.classList.remove('visible');
}

// ---------- THEME TOGGLE (Dark / Light) ----------
function initTheme() {
  const stored = sessionStorage.getItem('theme'); // hanya sesi, bukan data sensitif
  const isDark = stored ? stored === 'dark' : true; // default: dark mode premium
  document.documentElement.classList.toggle('light', !isDark);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
  const isLightNow = document.documentElement.classList.toggle('light');
  sessionStorage.setItem('theme', isLightNow ? 'light' : 'dark');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isLightNow ? '🌙' : '☀️';
}

// ---------- DEVICE ID (opsional, bukan data sensitif) ----------
function getDeviceId() {
  let id = sessionStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('deviceId', id);
  }
  return id;
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const dialogCloseBtn = document.getElementById('error-close-btn');
  if (dialogCloseBtn) dialogCloseBtn.addEventListener('click', hideErrorDialog);

  const overlay = document.getElementById('error-overlay');
  if (overlay) overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideErrorDialog();
  });
});
