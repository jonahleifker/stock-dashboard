const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "background-light": "#fafafa",
        "background-dark": "#121416",
        "surface-dark": "#212529",
        "text-secondary": "#a5b6a0",
        growth: "#4CAF50",
        loss: "#EF5350",
        primary: {
          DEFAULT: "#195f76", // Market Overview teal
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2d372a", // Stitch secondary/border
          foreground: "#ffffff",
        },
        border: "#2d372a",
        input: "#2d372a",
        ring: "#53d22d",
        brand: {
          DEFAULT: "#195f76",
          hover: "#1a6d87",
        },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
