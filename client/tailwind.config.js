/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd4ff',
          300: '#8eb9ff',
          400: '#4A90E2',
          500: '#3a7bd5',
          600: '#2a61b5',
          700: '#234e93',
          800: '#21437a',
          900: '#1f3a65',
        },
        secondary: {
          50: '#EAF4FF',
          100: '#d0e5f9',
          200: '#a8cdf3',
          300: '#75b0ea',
          400: '#4A90E2',
          500: '#2d72c7',
          600: '#1e58a8',
          700: '#1a4689',
          800: '#1b3c71',
          900: '#1b345e',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
