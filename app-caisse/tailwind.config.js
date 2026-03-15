/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Mono', 'monospace'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
