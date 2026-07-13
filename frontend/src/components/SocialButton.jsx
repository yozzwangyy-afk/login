// =========================================
// KOMPONEN: Tombol login sosial (reusable)
// =========================================
import { motion } from 'framer-motion';

export default function SocialButton({ icon, label, onClick, loading, disabled }) {
  return (
    <motion.button
      whileHover={{ y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative flex w-full items-center justify-center gap-3 rounded-xl
                 border border-graphite-900/10 dark:border-white/10
                 bg-white dark:bg-graphite-800/60
                 px-5 py-3 font-body text-sm font-medium
                 text-graphite-900 dark:text-white
                 shadow-sm transition-all duration-200
                 hover:border-amber-500/40 hover:shadow-md
                 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-graphite-900/20 border-t-amber-500 dark:border-white/20" />
      ) : (
        icon
      )}
      <span>{loading ? 'Menghubungkan…' : label}</span>
    </motion.button>
  );
}
