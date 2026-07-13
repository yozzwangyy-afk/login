// =========================================
// KOMPONEN: Toggle Dark / Light Mode
// =========================================
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('theme'); // sesi saja, bukan data sensitif
    const isDark = stored ? stored === 'dark' : true;
    setDark(isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('light', !next);
    sessionStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Ubah tema"
      className="rounded-full border border-graphite-900/10 dark:border-white/10 p-2 text-graphite-700 dark:text-white/70 transition hover:text-amber-500"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
