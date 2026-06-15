/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['JetBrains Mono', 'Noto Sans SC', 'sans-serif'],
      },
      colors: {
        rise: '#0077BB',
        fall: '#EE7733',
        surface: '#0b0d17',
        card: '#111322',
        border: '#1f2235',
        accent: '#f59e0b',
      },
    },
  },
  plugins: [],
};
