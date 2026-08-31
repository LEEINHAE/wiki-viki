import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#eefbf6", 100: "#d5f5e8", 500: "#19a974", 600: "#13865d", 700: "#106c4d" },
      },
      boxShadow: { panel: "0 1px 2px rgba(0,0,0,.06), 0 8px 28px rgba(15,23,42,.06)" },
    },
  },
  plugins: [],
};
export default config;
