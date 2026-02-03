import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1A1C18",
        surface: "#232621",
        primary: "#8DB580",
        secondary: "#A3AD9E",
        accent: "#E3B04B",
        text: "#E2E3DE",
        "text-muted": "#A3AD9E",
      },
    },
  },
  plugins: [],
};
export default config;
