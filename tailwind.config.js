/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './popup.jsx',
    './index.css'
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#0a0b14',
          secondary: '#12152e',
        },
        neon: {
          primary: '#00ff9d',
          secondary: '#00b8ff',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#D1D9E6',
            h1: { color: '#00ff9d' },
            h2: { color: '#00ff9d' },
            h3: { color: '#00ff9d' },
            strong: { color: '#00ff9d' },
            code: { color: '#D1D9E6' },
            pre: { backgroundColor: '#1a1b26' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 