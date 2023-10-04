import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  plugins: [forms({ strategy: "class" })],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
    colors: {
      ...colors,
      brand: {
        red: "#f44250",
        yellow: "#fecc1b",
        green: "#6bd968",
        aqua: "#3defe9",
        blue: "#3992ff",
        pink: "#d83bd2",
      },
    },
  },
} satisfies Config;
