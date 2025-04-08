/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: '640px',   // Small devices (min-width: 640px)
        md: '768px',   // Medium devices (min-width: 768px) - Tablets
        lg: '1024px',  // Large devices (min-width: 1024px) - Larger tablets, laptops
        xl: '1280px',  // Extra large devices (min-width: 1280px) - Large screens
      },
    },
  },
  plugins: [],
}
