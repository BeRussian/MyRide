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
          bg: '#080c14',
          panel: '#0e1524',
          card: '#131b2e',
          cardHover: '#18233c',
          border: '#1e293f',
          borderLight: '#2b3954',
          primary: '#2563eb',
          primaryHover: '#1d4ed8',
          accent: '#38bdf8',
          emerald: '#10b981',
          rose: '#f43f5e',
          text: '#f8fafc',
          subtext: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
