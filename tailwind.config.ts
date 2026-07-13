import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        void: {
          950: "#07080d",
          900: "#0a0c14",
          800: "#0f1220",
          700: "#161a2c",
          600: "#1e2338",
          500: "#3a4162",
          400: "#5a6288",
        },
        mist: {
          50: "#f7f7fb",
          100: "#eef0f7",
          200: "#dfe2ee",
          300: "#c7cbdc",
          400: "#a9aec6",
        },
        signal: {
          violet: "#7c5cff",
          cyan: "#22d3ee",
          magenta: "#e879f9",
        },
      },
      backgroundImage: {
        "signal-gradient":
          "linear-gradient(135deg, #7c5cff 0%, #4f8bff 45%, #22d3ee 100%)",
        "signal-gradient-soft":
          "linear-gradient(135deg, rgba(124,92,255,0.18) 0%, rgba(34,211,238,0.12) 100%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fade-up 0.35s ease-out",
        blink: "blink 1s step-start infinite",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.28)",
        "glass-lg": "0 24px 64px -12px rgba(0,0,0,0.45)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
