/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          header: '#303030',
          blue: '#1b74e4',
          unvisited: '#d1d5db',
          notanswered: '#e11d48',
          answered: '#16a34a',
          review: '#7c3aed',
          reviewmarked: '#9333ea',
        }
      }
    },
  },
  plugins: [],
}
