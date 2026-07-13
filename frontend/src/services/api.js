// =========================================
// SERVICE: API client (Axios) + auto refresh token
// =========================================
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // agar cookie refreshToken (httpOnly) ikut terkirim
});

// Access token disimpan hanya di memori (BUKAN localStorage) agar tidak
// mudah dicuri lewat XSS. Hilang saat refresh halaman -> di-refresh via /auth/refresh.
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Jika access token kedaluwarsa (401), coba refresh otomatis sekali,
// lalu ulangi request semula.
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!error.response) {
      error.friendlyCode = 'NO_INTERNET';
      return Promise.reject(error);
    }

    const errorCode = error.response.data && error.response.data.errorCode;

    if (errorCode === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, original });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.data.accessToken);
        queue.forEach((p) => p.resolve(api(p.original)));
        queue = [];
        return api(original);
      } catch (refreshErr) {
        queue.forEach((p) => p.reject(refreshErr));
        queue = [];
        setAccessToken(null);
        error.friendlyCode = 'SESSION_EXPIRED';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    error.friendlyCode = errorCode || 'UNKNOWN_ERROR';
    return Promise.reject(error);
  }
);

export default api;
