/** Konfigurasi Tailwind: dark mode via class, palet premium (graphite + amber) */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#0B0D12',
          900: '#12151C',
          800: '#1A1E28',
          700: '#242A38',
        },
        amber: {
          400: '#F2B979',
          500: '#E8A15C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
