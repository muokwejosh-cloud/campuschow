/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#EB4427',  // Mando vibrant terracotta red
          hover: '#D9381E',
          soft: '#FEECE9',
        },
        parchment: '#FAF7F2',  // Warm off-white background
        darkSurface: '#212121', // Pill CTA buttons
        charcoal: '#141414',   // Bold text headings
        subtle: '#666666',     // Subheadings and borders
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}