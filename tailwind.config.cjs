/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./popup.html", "./options.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
