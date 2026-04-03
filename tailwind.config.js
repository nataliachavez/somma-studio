/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        salmon:  "#C97B5A",
        dark:    "#2C2420",
        cream:   "#FAF8F5",
        muted:   "#9A8880",
        border:  "#E8E0D8",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans:  ["Jost", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
