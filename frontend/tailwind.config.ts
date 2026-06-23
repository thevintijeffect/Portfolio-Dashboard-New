import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080c12",
        surface: "#0d1219",
        card: "#111820",
        border: "#1c2635",
        accent: "#00d4ff",
        green: "#00e5a0",
        red: "#ff4d6a",
        gold: "#ffb830",
        purple: "#8b5cf6",
        text: "#e2eaf4",
        muted: "#7a95b0",
      },
      boxShadow: {
        glow: "0 0 32px rgba(0, 212, 255, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
