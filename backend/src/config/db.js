// =========================================
// KONEKSI DATABASE (MongoDB via Mongoose)
// =========================================
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[DB] MongoDB terhubung.');
  } catch (err) {
    console.error('[DB] Gagal konek ke MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
