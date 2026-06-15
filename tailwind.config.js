/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rise: '#ef4444',
        fall: '#22c55e',
      },
    },
  },
  plugins: [],
};
