/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // scan all JS/JSX/TSX files for Tailwind classes
  ],
  darkMode: 'class', // enables toggling dark mode via a class
  theme: {
    extend: {},
  },
  plugins: [],
}
