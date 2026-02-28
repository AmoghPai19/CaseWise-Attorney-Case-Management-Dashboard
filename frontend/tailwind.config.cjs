/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: "#0F1115",
        surface: "#181B21",
        surfaceHover: "#1F232B",
        border: "#2A2F3A",

        textPrimary: "#E6E8EC",
        textSecondary: "#9CA3AF",

        accent: "#C5A75D",

        success: "#2E7D32",
        danger: "#B94A48",
        warning: "#B08900"
      },

      fontFamily: {
        logo: ["BluuNext", "Playfair Display", "serif"],
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      },

      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.35)",
        innerSoft: "inset 0 1px 0 rgba(255,255,255,0.03)"
      }
    }
  },
  plugins: []
};