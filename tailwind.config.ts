import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        moss: "#355f4c",
        leaf: "#4d876b",
        gold: "#b78b36",
        paper: "#f7f3ea",
        linen: "#eee5d3",
        stone: "#d7d0c2",
        danger: "#b64a3b"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
