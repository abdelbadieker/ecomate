import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        "text-main": "var(--text-main)",
        "text-sub": "var(--text-sub)",
        "text-muted": "var(--text-muted)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        "dark-bg": "var(--dark-bg)",
        "dark-surface": "var(--dark-surface)",
        border: "var(--border)",
      },
      keyframes: {
        mqani: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      },
      animation: {
        mqani: 'mqani 40s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
