// =========================================
// HALAMAN: Dashboard (contoh halaman terproteksi)
// =========================================
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Anda telah keluar.');
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Dashboard</h1>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mx-auto mt-8 max-w-2xl rounded-3xl p-8"
      >
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
            alt={user.fullName}
            className="h-14 w-14 rounded-full border border-white/10 object-cover"
          />
          <div>
            <p className="font-display text-lg font-semibold">{user.fullName}</p>
            <p className="text-sm text-graphite-700 dark:text-white/60">@{user.username}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Info label="Email" value={user.email} />
          <Info label="Login via" value={user.provider} />
          <Info label="Role" value={user.role} />
          <Info label="Status" value={user.status} />
          <Info label="Akun dibuat" value={new Date(user.createdAt).toLocaleDateString('id-ID')} />
          <Info label="Login terakhir" value={new Date(user.lastLogin).toLocaleString('id-ID')} />
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/20"
        >
          Logout
        </button>
      </motion.div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-graphite-500 dark:text-white/40">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
