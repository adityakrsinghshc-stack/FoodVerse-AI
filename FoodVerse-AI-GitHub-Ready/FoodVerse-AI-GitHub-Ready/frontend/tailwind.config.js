/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f9f5',
          100: '#def2e8',
          200: '#bee5d3',
          300: '#90d1b6',
          400: '#5bb593',
          500: '#349974',
          600: '#257c5d',
          700: '#1e634b',
          800: '#1a4f3d',
          900: '#0d3b2e',
          950: '#06231b',
        },
        lime: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        cream: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f7edd7',
          300: '#f1ddb7',
        },
        accent: {
          orange: '#f97316',
          amber: '#d97706',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(13, 59, 46, 0.06), 0 2px 6px -1px rgba(13, 59, 46, 0.04)',
        'card': '0 10px 25px -5px rgba(13, 59, 46, 0.08), 0 8px 10px -6px rgba(13, 59, 46, 0.04)',
        'elevated': '0 20px 30px -10px rgba(13, 59, 46, 0.12), 0 10px 10px -5px rgba(13, 59, 46, 0.06)',
      }
    },
  },
  plugins: [],
}
