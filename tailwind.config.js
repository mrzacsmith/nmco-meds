/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          DEFAULT: 'var(--color-dark, #172A3A)',
        },
        mid: {
          DEFAULT: 'var(--color-mid, #508991)',
        },
        light: {
          DEFAULT: 'var(--color-light, #75DDDD)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #004346)',
        },
        background: {
          DEFAULT: 'var(--color-background, #FFFFFF)',
        },
        warmAccent: {
          DEFAULT: 'var(--color-warm-accent, #E5C687)',
        },
        white: {
          DEFAULT: 'var(--color-white, #FFFFFF)',
        },
      },
      boxShadow: {
        custom: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'custom-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
