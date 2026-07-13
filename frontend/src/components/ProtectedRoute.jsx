// =========================================
// KOMPONEN: Proteksi Route di sisi Frontend
// (Middleware backend tetap sumber kebenaran utama keamanan)
// =========================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-graphite-900/20 border-t-amber-500 dark:border-white/20" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
