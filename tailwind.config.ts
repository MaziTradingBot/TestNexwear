import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        // Luxury fashion palette
        ink: "#0A0A0A", // near-black primary text / buttons
        charcoal: "#1C1C1C",
        graphite: "#3A3A3A",
        stone: "#6B6B6B", // muted text
        mist: "#9A9A9A",
        cream: "#F3ECDD", // deeper warm cream — page background
        bone: "#ECE3D2", // warm beige surface / panels
        sand: "#E4DAC6", // soft beige panels
        line: "#DDD3C0", // warm hairline borders
        gold: {
          DEFAULT: "#B07A3E", // warm bronze accent
          light: "#CC9856",
          dark: "#8C5F2A",
        },
        sale: "#9B2C2C", // deep wine for sale tags
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.25em",
        wide2: "0.15em",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        fadeIn: "fadeIn 0.5s ease-out",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
