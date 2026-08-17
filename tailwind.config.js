/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F6F7FA",
          dark: "#0D1117",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#161B22",
        },
        border: {
          DEFAULT: "#E4E7EC",
          dark: "#242B36",
        },
        ink: {
          DEFAULT: "#12141A",
          dim: "#5B6472",
          dark: "#E7E9EE",
          "dark-dim": "#8B93A7",
        },
        brand: {
          50: "#EEF1FE",
          100: "#DCE1FD",
          300: "#8E9BF3",
          500: "#3D4FE0",
          600: "#2F3EC2",
          700: "#26319B",
        },
        stock: {
          ok: "#2FA876",
          low: "#E8A33D",
          out: "#E5484D",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(17, 20, 27, 0.04), 0 1px 6px -1px rgba(17, 20, 27, 0.06)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
