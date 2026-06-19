/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // আপনার অন্য ফোল্ডারগুলোর পাথ...
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}