/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f0',
          100: '#fae5dc',
          200: '#f5ccbb',
          300: '#eda690',
          400: '#e3775f',
          500: '#d75037',
          600: '#c53924',
          700: '#a32b1b',
          800: '#86261a',
          900: '#70241b',
          950: '#3d0f09',
        }
      }
    },
  },
  plugins: [],
}
