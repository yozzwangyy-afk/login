// =========================================
// AUTH LOGIC: Halaman Login
// =========================================
(function () {
  const cfg = window.APP_CONFIG;
  const rememberCheckbox = document.getElementById('remember-me');

  const buttons = {
    google: document.getElementById('btn-google'),
    facebook: document.getElementById('btn-facebook'),
    apple: document.getElementById('btn-apple'),
  };

  // Jika sudah ada sesi aktif (Auto Login / Remember Me), langsung ke dashboard
  (async function checkExistingSession() {
    try {
      await Api.refreshAccessToken();
      window.location.href = 'dashboard.html';
    } catch (e) {
      // Belum ada sesi -> tetap di halaman login, ini normal
    }
  })();

  function setLoading(providerKey, isLoading) {
    Object.entries(buttons).forEach(([key, btn]) => {
      if (!btn) return;
      if (key === providerKey) {
        btn.disabled = isLoading;
        const iconSlot = btn.querySelector('.icon-slot');
        const label = btn.querySelector('.btn-label');
        if (isLoading) {
          iconSlot.innerHTML = '<span class="spinner"></span>';
          label.textContent = 'Menghubungkan…';
        } else {
          label.textContent = `Continue with ${providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}`;
          // Icon asli dikembalikan dengan reload halaman jika perlu; cukup re-render dari HTML asal
        }
      } else {
        btn.disabled = isLoading; // kunci tombol lain selama proses berlangsung
      }
    });
  }

  // Kirim token hasil verifikasi provider ke backend kita.
  // Backend yang melakukan verifikasi ulang token ke server resmi provider.
  async function completeLogin(endpoint, payload, providerKey) {
    setLoading(providerKey, true);
    try {
      const res = await Api.post(`/auth/${endpoint}`, {
        ...payload,
        rememberMe: rememberCheckbox.checked,
        deviceId: getDeviceId(),
      });
      Api.setAccessToken(res.data.accessToken);
      sessionStorage.setItem('currentUser', JSON.stringify(res.data.user));
      showToast(res.data.isNewUser ? 'Akun berhasil dibuat!' : 'Berhasil masuk kembali.', 'success');
      setTimeout(() => (window.location.href = 'dashboard.html'), 600);
    } catch (err) {
      showErrorDialog(err.errorCode || 'UNKNOWN_ERROR');
      showToast('Login gagal, silakan coba lagi.', 'error');
    } finally {
      setLoading(providerKey, false);
      restoreButtonIcons();
    }
  }

  // Kembalikan ikon asli tombol setelah loading selesai (karena innerHTML sempat diganti spinner)
  function restoreButtonIcons() {
    document.getElementById('btn-google').querySelector('.icon-slot').innerHTML = ORIGINAL_ICONS.google;
    document.getElementById('btn-facebook').querySelector('.icon-slot').innerHTML = ORIGINAL_ICONS.facebook;
    document.getElementById('btn-apple').querySelector('.icon-slot').innerHTML = ORIGINAL_ICONS.apple;
  }

  const ORIGINAL_ICONS = {
    google: document.getElementById('btn-google').querySelector('.icon-slot').innerHTML,
    facebook: document.getElementById('btn-facebook').querySelector('.icon-slot').innerHTML,
    apple: document.getElementById('btn-apple').querySelector('.icon-slot').innerHTML,
  };

  // ---------- GOOGLE: Google Identity Services ----------
  let googleInitialized = false;
  function initGoogleIfNeeded() {
    if (googleInitialized || !window.google || !cfg.GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: cfg.GOOGLE_CLIENT_ID,
      callback: (response) => {
        // response.credential = idToken, diverifikasi ulang di backend
        completeLogin('google', { idToken: response.credential }, 'google');
      },
    });
    googleInitialized = true;
  }

  buttons.google.addEventListener('click', () => {
    initGoogleIfNeeded();
    if (!window.google) return showErrorDialog('PROVIDER_UNAVAILABLE');
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        showErrorDialog('USER_CANCELLED');
      }
    });
  });

  // ---------- FACEBOOK: Facebook SDK ----------
  window.fbAsyncInit = function () {
    window.FB.init({ appId: cfg.FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' });
  };

  buttons.facebook.addEventListener('click', () => {
    if (!window.FB) return showErrorDialog('PROVIDER_UNAVAILABLE');
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          completeLogin('facebook', { accessToken: response.authResponse.accessToken }, 'facebook');
        } else {
          showErrorDialog('USER_CANCELLED');
        }
      },
      { scope: 'public_profile,email' }
    );
  });

  // ---------- APPLE: Sign in with Apple JS ----------
  let appleInitialized = false;
  function initAppleIfNeeded() {
    if (appleInitialized || !window.AppleID) return;
    window.AppleID.auth.init({
      clientId: cfg.APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: cfg.APPLE_REDIRECT_URI,
      usePopup: true,
    });
    appleInitialized = true;
  }

  buttons.apple.addEventListener('click', async () => {
    initAppleIfNeeded();
    if (!window.AppleID) return showErrorDialog('PROVIDER_UNAVAILABLE');
    try {
      setLoading('apple', true);
      const res = await window.AppleID.auth.signIn();
      const fullName = res.user && res.user.name
        ? `${res.user.name.firstName} ${res.user.name.lastName}`
        : undefined;
      await completeLogin('apple', { identityToken: res.authorization.id_token, fullName }, 'apple');
    } catch (err) {
      setLoading('apple', false);
      restoreButtonIcons();
      if (err && err.error === 'popup_closed_by_user') showErrorDialog('USER_CANCELLED');
      else showErrorDialog('LOGIN_FAILED');
    }
  });
})();
