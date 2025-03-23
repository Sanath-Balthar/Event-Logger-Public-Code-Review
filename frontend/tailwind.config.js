/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightNavy: "#254E70", // Custom Light Navy Blue
      },
    },
  },
  plugins: [],
}

