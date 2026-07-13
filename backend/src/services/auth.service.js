// =========================================
// SERVICE: Auth (logika inti autentikasi)
// =========================================
const User = require('../models/User');
const validator = require('validator');
const { nanoid } = require('nanoid');

// Buat username otomatis & unik dari email/nama jika belum ada
async function generateUsername(base) {
  const cleanBase = (base || 'user')
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  let candidate = `${cleanBase}${Math.floor(1000 + Math.random() * 9000)}`;
  // Pastikan unik, retry jika bentrok
  // (skala kecil: cukup cek ulang beberapa kali)
  let exists = await User.findOne({ username: candidate });
  let attempts = 0;
  while (exists && attempts < 5) {
    candidate = `${cleanBase}${nanoid(6)}`;
    exists = await User.findOne({ username: candidate });
    attempts++;
  }
  return candidate;
}

// Fungsi utama: cari user berdasarkan provider, jika tidak ada -> buat baru.
// Ini yang memenuhi requirement "login & register otomatis" dan
// "user lama tidak dibuatkan akun baru".
async function findOrCreateUser({
  provider,
  providerId,
  email,
  fullName,
  avatar,
  deviceId,
}) {
  // Sanitasi input dasar (defense-in-depth, selain validasi di controller)
  const safeEmail = email && validator.isEmail(email) ? validator.normalizeEmail(email) : null;
  const safeName = validator.escape((fullName || 'Pengguna').trim());

  let user = await User.findOne({ provider, providerId });

  if (user) {
    // USER LAMA -> langsung login, jangan buat akun baru
    if (user.status !== 'active') {
      const err = new Error('Akun dinonaktifkan');
      err.code = 'ACCOUNT_DISABLED';
      throw err;
    }
    user.lastLogin = new Date();
    if (deviceId) user.deviceId = deviceId;
    // Sinkronkan data terbaru dari provider (foto/nama bisa berubah)
    if (avatar) user.avatar = avatar;
    if (safeEmail) user.email = safeEmail;
    await user.save();
    return { user, isNewUser: false };
  }

  // USER BARU -> register otomatis
  const uid = `${provider}_${providerId}`;
  const username = await generateUsername(safeEmail || safeName);

  user = await User.create({
    uid,
    fullName: safeName,
    username,
    email: safeEmail || `${uid}@no-email.local`,
    avatar,
    provider,
    providerId,
    deviceId,
    role: 'user',
    status: 'active',
    lastLogin: new Date(),
  });

  return { user, isNewUser: true };
}

module.exports = { findOrCreateUser };
