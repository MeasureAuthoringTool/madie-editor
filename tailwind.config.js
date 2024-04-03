module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      green: {
        DEFAULT: "#1dd65e",
        700: "#0e9a5b",
      },
      slate: {
        DEFAULT: "#EDEDED",
      },
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
