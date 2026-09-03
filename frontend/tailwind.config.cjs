/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: "#F7F7F8",
        surface: "#FFFFFF",
        surfaceHover: "#FAFAFA",
        border: "#E5E7EB",

        textPrimary: "#101113",
        textSecondary: "#6B7280",

        accent: "#0A0A0A",

        success: "#067647",
        danger: "#B42318",
        warning: "#B54708"
      },

      fontFamily: {
        logo: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      },

      boxShadow: {
        soft: "0 1px 2px rgba(16,17,19,0.04)",
        innerSoft: "inset 0 1px 0 rgba(16,17,19,0.02)"
      }
    }
  },
  plugins: []
};