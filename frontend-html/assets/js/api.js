// =========================================
// API CLIENT: fetch wrapper + auto refresh token
// Access token disimpan di variabel memori (module-level),
// BUKAN localStorage, agar tidak mudah dicuri via XSS.
// =========================================
const Api = (() => {
  const BASE_URL = window.APP_CONFIG.API_URL;
  let accessToken = null;
  let isRefreshing = false;
  let refreshPromise = null;

  function setAccessToken(token) {
    accessToken = token;
  }
  function getAccessToken() {
    return accessToken;
  }

  // Request generik ke backend, otomatis kirim cookie (credentials: 'include')
  async function request(path, { method = 'GET', body, retry = true } = {}) {
    let response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: 'include', // agar cookie refreshToken httpOnly ikut terkirim
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      // fetch gagal total -> biasanya tidak ada koneksi internet
      const err = new Error('NO_INTERNET');
      err.errorCode = 'NO_INTERNET';
      throw err;
    }

    let json = null;
    try {
      json = await response.json();
    } catch (e) {
      /* body kosong, biarkan json = null */
    }

    if (response.ok) return json;

    const errorCode = (json && json.errorCode) || 'UNKNOWN_ERROR';

    // Access token kedaluwarsa -> coba refresh sekali, lalu ulangi request
    if (errorCode === 'TOKEN_EXPIRED' && retry) {
      await refreshAccessToken();
      return request(path, { method, body, retry: false });
    }

    const err = new Error((json && json.message) || 'Request gagal');
    err.errorCode = errorCode;
    throw err;
  }

  // Refresh token dipanggil otomatis; jika beberapa request 401 bersamaan,
  // hanya satu refresh yang benar-benar dijalankan (dibagikan lewat promise).
  async function refreshAccessToken() {
    if (isRefreshing) return refreshPromise;
    isRefreshing = true;
    refreshPromise = request('/auth/refresh', { method: 'POST', retry: false })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res;
      })
      .catch((err) => {
        setAccessToken(null);
        throw err;
      })
      .finally(() => {
        isRefreshing = false;
      });
    return refreshPromise;
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    setAccessToken,
    getAccessToken,
    refreshAccessToken,
  };
})();
