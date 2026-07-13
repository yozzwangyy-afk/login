// =========================================
// MODEL: User
// Menyimpan seluruh data akun sesuai requirement
// =========================================
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    // UID unik gabungan provider + providerId, dipakai sebagai identitas utama
    uid: { type: String, required: true, unique: true, index: true },

    fullName: { type: String, required: true, trim: true },

    // Username opsional, dibuat otomatis dari email/nama jika belum ada
    username: { type: String, unique: true, sparse: true, trim: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    avatar: { type: String, default: null }, // Foto profil

    provider: {
      type: String,
      enum: ['google', 'facebook', 'apple'],
      required: true,
    },

    providerId: { type: String, required: true }, // ID dari provider OAuth

    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    status: {
      type: String,
      enum: ['active', 'disabled', 'banned'],
      default: 'active',
    },

    deviceId: { type: String, default: null },

    // Hash refresh token aktif (bukan token asli) untuk validasi & revoke
    refreshTokenHash: { type: String, default: null },

    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, // "Tanggal Akun Dibuat" & update terakhir
  }
);

// Index gabungan agar 1 akun per provider+providerId (mencegah duplikat akun)
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
