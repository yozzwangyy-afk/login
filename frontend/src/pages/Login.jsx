// =========================================
// HALAMAN: Login / Register
// =========================================
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SocialButton from '../components/SocialButton';
import ErrorDialog from '../components/ErrorDialog';
import ThemeToggle from '../components/ThemeToggle';
import { GoogleIcon, FacebookIcon, AppleIcon } from '../components/ProviderIcons';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI;

export default function Login() {
  const [rememberMe, setRememberMe] = useState(true);
  const [loadingProvider, setLoadingProvider] = useState(null); // 'google' | 'facebook' | 'apple' | null
  const [errorCode, setErrorCode] = useState(null);
  const googleBtnRef = useRef(null);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  // Generate deviceId sederhana & persisten per-browser (bukan data sensitif)
  function getDeviceId() {
    let id = sessionStorage.getItem('deviceId');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('deviceId', id);
    }
    return id;
  }

  // Kirim hasil verifikasi ke backend kita, backend yang verifikasi ulang ke provider
  async function completeLogin(endpoint, payload, providerKey) {
    setLoadingProvider(providerKey);
    try {
      const { data } = await api.post(`/auth/${endpoint}`, {
        ...payload,
        rememberMe,
        deviceId: getDeviceId(),
      });
      loginSuccess(data.data.user, data.data.accessToken);
      toast.success(data.data.isNewUser ? 'Akun berhasil dibuat!' : 'Berhasil masuk kembali.');
      navigate('/dashboard');
    } catch (err) {
      const code = (err.response && err.response.data && err.response.data.errorCode) || err.friendlyCode || 'UNKNOWN_ERROR';
      setErrorCode(code);
      toast.error('Login gagal, silakan coba lagi.');
    } finally {
      setLoadingProvider(null);
    }
  }

  // ---------- GOOGLE: Google Identity Services ----------
  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        // response.credential = idToken, diverifikasi ulang di backend
        completeLogin('google', { idToken: response.credential }, 'google');
      },
    });
    if (googleBtnRef.current) {
      // Render tombol Google native tersembunyi, kita trigger via tombol kustom
      window.google.accounts.id.renderButton(googleBtnRef.current, { type: 'icon' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleGoogleClick() {
    if (!window.google) return setErrorCode('PROVIDER_UNAVAILABLE');
    // Klik tombol native tersembunyi agar popup akun Google resmi muncul
    const hiddenBtn = googleBtnRef.current && googleBtnRef.current.querySelector('div[role="button"]');
    if (hiddenBtn) hiddenBtn.click();
    else window.google.accounts.id.prompt();
  }

  // ---------- FACEBOOK: Facebook SDK ----------
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' });
    };
  }, []);

  function handleFacebookClick() {
    if (!window.FB) return setErrorCode('PROVIDER_UNAVAILABLE');
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          completeLogin('facebook', { accessToken: response.authResponse.accessToken }, 'facebook');
        } else {
          setErrorCode('USER_CANCELLED');
        }
      },
      { scope: 'public_profile,email' }
    );
  }

  // ---------- APPLE: Sign in with Apple JS ----------
  useEffect(() => {
    if (!window.AppleID) return;
    window.AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: APPLE_REDIRECT_URI,
      usePopup: true,
    });
  }, []);

  async function handleAppleClick() {
    if (!window.AppleID) return setErrorCode('PROVIDER_UNAVAILABLE');
    try {
      setLoadingProvider('apple');
      const res = await window.AppleID.auth.signIn();
      const fullName = res.user && res.user.name ? `${res.user.name.firstName} ${res.user.name.lastName}` : undefined;
      await completeLogin('apple', { identityToken: res.authorization.id_token, fullName }, 'apple');
    } catch (err) {
      setLoadingProvider(null);
      if (err && err.error === 'popup_closed_by_user') setErrorCode('USER_CANCELLED');
      else setErrorCode('LOGIN_FAILED');
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Ambient background blobs — signature visual halaman ini */}
      <div className="ambient-blob pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="ambient-blob pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-graphite-700/40 blur-3xl" style={{ animationDelay: '3s' }} />

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500" />
          <h1 className="font-display text-2xl font-semibold tracking-tight">Selamat Datang</h1>
          <p className="mt-1 text-sm text-graphite-700 dark:text-white/60">
            Masuk atau daftar hanya dalam satu ketukan.
          </p>
        </div>

        <div className="space-y-3">
          <SocialButton
            icon={<GoogleIcon />}
            label="Continue with Google"
            onClick={handleGoogleClick}
            loading={loadingProvider === 'google'}
            disabled={!!loadingProvider}
          />
          <SocialButton
            icon={<FacebookIcon />}
            label="Continue with Facebook"
            onClick={handleFacebookClick}
            loading={loadingProvider === 'facebook'}
            disabled={!!loadingProvider}
          />
          <SocialButton
            icon={<AppleIcon />}
            label="Continue with Apple"
            onClick={handleAppleClick}
            loading={loadingProvider === 'apple'}
            disabled={!!loadingProvider}
          />
        </div>

        {/* Tombol Google native tersembunyi, dipakai untuk memicu popup resmi */}
        <div ref={googleBtnRef} className="hidden" />

        <label className="mt-6 flex items-center justify-center gap-2 text-sm text-graphite-700 dark:text-white/60">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-graphite-900/20 text-amber-500 focus:ring-amber-500"
          />
          Ingat saya di perangkat ini
        </label>

        <p className="mt-6 text-center text-xs text-graphite-500 dark:text-white/40">
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan &amp; Kebijakan Privasi kami.
        </p>
      </motion.div>

      <ErrorDialog code={errorCode} onClose={() => setErrorCode(null)} />
    </div>
  );
}
