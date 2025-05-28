/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: '640px',   // Small devices
        md: '768px',   // Medium devices
        lg: '1024px',  // Large devices
        xl: '1280px',  // Extra large devices
      },
      keyframes: {
        'bounce-square': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'bounce-square': 'bounce-square 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
