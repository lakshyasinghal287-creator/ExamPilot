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
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        // Linear & Obsidian inspired canvas layers
        canvas: {
          dark: '#08090E',
          light: '#F8FAFC',
        },
        surface: {
          DEFAULT: '#0E121B',
          elevated: '#151A26',
          hover: '#1C2232',
          card: '#0D111A',
        },
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
      boxShadow: {
        'specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'specular-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
        'glow-amber': '0 0 30px -5px rgba(245, 158, 11, 0.22)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.22)',
        'glow-violet': '0 0 30px -5px rgba(139, 92, 246, 0.22)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.22)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
      }
    },
  },
  plugins: [],
}
