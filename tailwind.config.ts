import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f3f7f3",
          100: "#e4eee4",
          600: "#376346",
          700: "#294f37",
          800: "#203f2d",
          900: "#183224"
        },
        sand: "#f5f0e6"
      }
    }
  },
  plugins: []
};

export default config;
