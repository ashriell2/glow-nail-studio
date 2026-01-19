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
        primary: {
          DEFAULT: "#F59E0B", // Altın Sarısı (Butonlar)
          light: "#FCD34D",   // Açık Sarı
          dark: "#B45309",    // Koyu Turuncu
        },
        background: "#0F172A", // Koyu Lacivert (Arka Plan - Dark Mode)
        surface: "#1E293B",    // Kart Rengi (Daha açık lacivert)
      },
    },
  },
  plugins: [],
};
export default config;