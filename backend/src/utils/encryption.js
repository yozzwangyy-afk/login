// =========================================
// UTIL: Enkripsi & Hashing
// Refresh token TIDAK disimpan mentah di DB, hanya hash + versi terenkripsi
// untuk cookie. Ini melindungi dari kebocoran DB dan manipulasi token.
// =========================================
const CryptoJS = require('crypto-js');
const crypto = require('crypto');

const SECRET = process.env.TOKEN_ENCRYPTION_KEY;

// Enkripsi string (dipakai sebelum menaruh token sensitif di cookie)
function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
}

// Dekripsi string
function decrypt(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Hash satu arah (untuk menyimpan representasi refresh token di DB)
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = { encrypt, decrypt, sha256 };
