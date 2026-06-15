/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
}

function addVariablesForColors({ addBase, theme }) {
  const flatten = (colors, prefix = "") =>
    Object.entries(colors).flatMap(([key, value]) => {
      const name = prefix ? `${prefix}-${key}` : key
      if (typeof value === "string") return [[`--${name}`, value]]
      return flatten(value, name)
    })

  const newVars = Object.fromEntries(flatten(theme("colors")))

  addBase({
    ":root": newVars,
  })
}
