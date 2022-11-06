/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        turquoise: '#72e1d1',
        lavblue: '#bbbdf6',
        'dark-purple': {
          100: '#664e7e',
          200: '#5c4672',
          400: '#473758',
          500: '#3d2f4b',
          600: '#2f243a',
          700: '#291f32',
          800: '#1f1826',
          900: '#141019'
        },
        'yellow-crayola': '#f4e87c',
        ruby: '#d81159',
        slimevr: '#8f47d3',
        owotrack: '#93ff74'
      }
    }
  },
  plugins: []
};
