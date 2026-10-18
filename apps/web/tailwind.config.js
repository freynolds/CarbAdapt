const preset = require("@carbadapt/design-tokens/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}"],
};
