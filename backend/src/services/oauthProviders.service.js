// =========================================
// SERVICE: Verifikasi token OAuth di BACKEND
// Setiap token dari client diverifikasi ulang ke server resmi provider.
// Ini mencegah client memalsukan identitas (token manipulation).
// =========================================
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const https = require('https');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ---------- GOOGLE ----------
// idToken dikirim dari frontend (Google Identity Services)
async function verifyGoogleToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    providerId: payload.sub,
    email: payload.email,
    fullName: payload.name,
    avatar: payload.picture,
  };
}

// ---------- FACEBOOK ----------
// accessToken dikirim dari Facebook SDK di frontend, kita tukar ke Graph API
function fetchFacebookProfile(accessToken) {
  return new Promise((resolve, reject) => {
    const url = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`;
    https
      .get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            resolve(json);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function verifyFacebookToken(accessToken) {
  const profile = await fetchFacebookProfile(accessToken);
  return {
    providerId: profile.id,
    email: profile.email,
    fullName: profile.name,
    avatar: profile.picture && profile.picture.data && profile.picture.data.url,
  };
}

// ---------- APPLE ----------
// identityToken dikirim dari frontend (Sign in with Apple JS)
async function verifyAppleToken(identityToken, fullNameFromClient) {
  const payload = await appleSignin.verifyIdToken(identityToken, {
    audience: process.env.APPLE_CLIENT_ID,
    ignoreExpiration: false,
  });
  // Apple hanya mengirim nama lengkap SEKALI saat pertama kali login,
  // jadi kita terima dari client di request pertama saja.
  return {
    providerId: payload.sub,
    email: payload.email,
    fullName: fullNameFromClient || 'Apple User',
    avatar: null, // Apple tidak menyediakan foto profil
  };
}

module.exports = { verifyGoogleToken, verifyFacebookToken, verifyAppleToken };
