/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0a0a0a',
          surface: '#121212',
          border: '#27272a',
        },
        light: {
          bg: '#f4f4f5',
          card: '#ffffff',
          border: '#e4e4e7',
        }
      },
      boxShadow: {
        'card': '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        'pill': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 60px -15px rgba(255, 255, 255, 0.06)',
      }
    },
  },
  plugins: [],
}
