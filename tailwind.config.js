/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(234, 179, 8, 0.8)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [],
}
