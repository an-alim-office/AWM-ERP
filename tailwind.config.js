/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface shades
        surface: {
          800: "var(--surface-800)",
          900: "var(--surface-900)",
          950: "var(--surface-950)",
        },
        // Brand palette (cyan/indigo hybrid)
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
        },
      },
      boxShadow: {
        glow: "0 10px 40px rgba(0,0,0,0.25)",
        "glow-strong": "0 12px 50px rgba(34,211,238,0.25), 0 6px 22px rgba(99,102,241,0.18)",
      },
      backgroundImage: {
        'premium-radials':
          "radial-gradient(circle at top left, rgba(34,211,238,0.14), transparent 35%), radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 30%), linear-gradient(135deg, #020817, #07152f, #0f172a)",
      },
    },
  },
  plugins: [],
}