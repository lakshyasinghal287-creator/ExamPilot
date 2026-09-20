/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Authentic TCS iON CBT exam palette (strictly preserved for the exam screen)
        cat: {
          header: '#385870',
          darkHeader: '#213545',
          blue: '#1b74e4',
          unvisited: '#e5e7eb',
          notanswered: '#ef4444',
          answered: '#22c55e',
          review: '#a855f7',
          reviewmarked: '#9333ea',
        }
      },
    },
  },
  plugins: [],
}
