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
        border: "#dce2ea",
        input: "#dce2ea",
        ring: "#006aff",
        background: "#f9fafb",
        foreground: "#000000",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#f1f4f8",
          foreground: "#405168",
        },
        accent: {
          DEFAULT: "#f1f5f9",
          foreground: "#000000",
        },
        primary: {
          DEFAULT: "#006aff", // Bluesky Blue
          foreground: "#ffffff",
          hover: "rgba(0, 106, 255, 0.92)",
        },
        ink: {
          DEFAULT: "#000000",
          slate: "#405168",
          steel: "#667b99",
          mute: "#8798b0",
        },
        navy: {
          deep: "#354358",
        },
        sky: {
          tint: "#c0dcf0",
        },
        page: "#f9fafb",
        canvas: "#ffffff",
        hairline: {
          DEFAULT: "#dce2ea",
          soft: "#e5e5e0",
        },
        scrim: "rgba(0, 0, 0, 0.60)",
        overlay: "rgba(0, 0, 0, 0.55)",
      },
      borderRadius: {
        full: "999px",
        modal: "21px",
        card: "12px",
      },
      fontFamily: {
        sans: [
          "InterVariable",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        flat: "0 0 0 1px #dce2ea",
        modal: "0 20px 50px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px #dce2ea",
        glow: "0 0 20px rgba(0, 106, 255, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
