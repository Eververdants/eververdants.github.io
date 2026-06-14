/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Geist Sans', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        warm: {
          50: '#faf8f5',
          100: '#f5f2ed',
          200: '#ece8e0',
          300: '#d6cfc2',
          400: '#a8a29e',
        },
        forest: {
          50: '#d8f3dc',
          100: '#b7e4c7',
          200: '#95d5b2',
          300: '#74c69d',
          400: '#52b788',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#081c15',
        },
        amber: {
          50: '#fef3c7',
          100: '#fde68a',
          500: '#d97706',
          600: '#b45309',
        },
        ink: '#1c1917',
      },
      maxWidth: {
        'article': '48rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'coin-glow': 'coinGlow 2s ease-in-out infinite',
        'coin-sparkle': 'coinSparkle 1.5s ease-in-out infinite',
        'coin-float': 'coinFloat 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        flowDash: {
          to: { strokeDashoffset: '-14' },
        },
        coinGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(217,119,6,0.3), 0 0 20px rgba(251,191,36,0.2)' },
          '50%': { boxShadow: '0 0 16px rgba(217,119,6,0.6), 0 0 40px rgba(251,191,36,0.4)' },
        },
        coinSparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        coinFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
