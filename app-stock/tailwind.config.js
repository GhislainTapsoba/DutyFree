/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          900: '#0A0E1A',
          800: '#111827',
          700: '#1C2333',
          600: '#2A3347',
        },
        gold: {
          400: '#F5C842',
          500: '#E8B800',
          600: '#C99D00',
        },
        sage: {
          400: '#6EE7B7',
          500: '#10B981',
        },
        crimson: {
          400: '#F87171',
          500: '#EF4444',
        },
        slate: {
          border: '#2A3347',
        }
      },
    },
  },
  plugins: [],
}

