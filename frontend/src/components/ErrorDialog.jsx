// =========================================
// KOMPONEN: Dialog Error Informatif
// Menerjemahkan errorCode teknis -> pesan yang mudah dipahami pengguna
// =========================================
import { AnimatePresence, motion } from 'framer-motion';

// Peta seluruh skenario error yang diminta requirement
export const ERROR_MESSAGES = {
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

export default function ErrorDialog({ code, onClose }) {
  return (
    <AnimatePresence>
      {code && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-sm rounded-2xl p-6"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              !
            </div>
            <h3 className="mb-1 font-display text-lg font-semibold">Login Bermasalah</h3>
            <p className="mb-5 text-sm text-graphite-700 dark:text-white/70">
              {ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR}
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-graphite-950 transition hover:bg-amber-400"
            >
              Mengerti
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
