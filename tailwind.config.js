/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          deep: '#1A0D3F',
          dark: '#0B0F19',
        },
        cyan: {
          electric: '#00F0FF',
        },
        lavender: {
          neon: '#A742FF',
        },
        emerald: {
          neon: '#10B981',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'blob-float': 'blobFloat 18s ease-in-out infinite',
        'blob-float-slow': 'blobFloat 26s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        blobFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px 0px var(--glow-color, rgba(0,240,255,0.4))' },
          '50%': { boxShadow: '0 0 40px 8px var(--glow-color, rgba(0,240,255,0.7))' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
      },
    },
  },
  plugins: [],
};
