/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#172A3A', // Prussian blue
        secondary: '#508991', // Blue Munsell
        accent: '#75DDDD', // Tiffany Blue
        dark: '#004346', // Midnight green
        light: '#FFFFFF', // White
        warmAccent: '#E5C687', // Ecru
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
    },
  },
  plugins: [],
}
