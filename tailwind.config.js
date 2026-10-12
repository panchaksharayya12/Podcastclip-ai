/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#08090B',
        charcoal: '#111318',
        panel: '#191B21',
        'panel-light': '#22252E',
        secondary: '#A7ABB4',
        accent: {
          DEFAULT: '#C7F36B',
          hover: '#b5e357',
          dim: 'rgba(199, 243, 107, 0.15)',
          glow: 'rgba(199, 243, 107, 0.35)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          default: 'rgba(255, 255, 255, 0.12)',
          highlight: 'rgba(255, 255, 255, 0.2)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
