/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fcfcff',
        surface: '#ffffff',
        primary: '#6c48f2', /* Vibrant Indigo/Purple */
        primaryHover: '#5835db',
        secondary: '#64748b',
        textMain: '#1e293b',
        accent: '#f3e8ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 20px 40px -15px rgba(0,0,0,0.05)',
        'soft-purple': '0 10px 40px -10px rgba(108, 72, 242, 0.25)',
      }
    },
  },
  plugins: [],
}
