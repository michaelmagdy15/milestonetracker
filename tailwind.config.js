/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Fira Sans"', 'Manrope', '"Cairo"', 'sans-serif'],
        display: ['"Fira Sans"', 'Manrope', '"Cairo"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        orange: {
          50: 'rgb(var(--brand-50, 255 247 237) / <alpha-value>)',
          100: 'rgb(var(--brand-100, 255 237 213) / <alpha-value>)',
          200: 'rgb(var(--brand-200, 254 215 170) / <alpha-value>)',
          300: 'rgb(var(--brand-300, 253 186 116) / <alpha-value>)',
          400: '#ff7432',
          500: '#f3822d',
          600: '#e06510',
          700: 'rgb(var(--brand-700, 194 65 12) / <alpha-value>)',
          800: 'rgb(var(--brand-800, 154 52 18) / <alpha-value>)',
          900: 'rgb(var(--brand-900, 124 45 18) / <alpha-value>)',
          950: 'rgb(var(--brand-950, 67 20 7) / <alpha-value>)',
        },
        nexus: {
          squid: '#192631',
          elevated: '#1f2f3d',
          panel: '#243746',
          orange: '#e04b2a',
          phthalo: '#123524',
          coral: '#ff7f50',
          light: '#f5f5f5',
        },
        dec: {
          bg: '#0f0f0f',
          card: '#1a1a1a',
          border: '#2a2a2a',
          text: '#f3f3f3',
          muted: '#999999',
          accent: '#f3822d',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'orange-glow': '0 0 20px rgba(243, 130, 45, 0.15)',
        'orange-glow-strong': '0 0 30px rgba(243, 130, 45, 0.25)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }
    },
  },
  plugins: [],
}
