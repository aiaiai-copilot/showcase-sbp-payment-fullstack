/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(142, 76%, 36%)', // green-600
          foreground: 'hsl(0, 0%, 100%)',
        },
      },
    },
  },
  plugins: [],
}
