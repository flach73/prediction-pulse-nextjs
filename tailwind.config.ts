import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vuexy Primary Purple
        primary: {
          DEFAULT: '#7367F0',
          light: '#8F85F3',
          dark: '#675DD8',
          50: '#F3F2FF',
          100: '#E8E6FF',
          200: '#D4D0FF',
          300: '#B5AEFF',
          400: '#9A91F5',
          500: '#7367F0',
          600: '#5A4ED8',
          700: '#4A3FC0',
          800: '#3D349D',
          900: '#332D7A',
        },
        // Vuexy Secondary
        secondary: {
          DEFAULT: '#808390',
          light: '#999CA6',
          dark: '#737682',
        },
        // Vuexy Success Green
        success: {
          DEFAULT: '#28C76F',
          light: '#53D28C',
          dark: '#24B364',
        },
        // Vuexy Error Red
        error: {
          DEFAULT: '#FF4C51',
          light: '#FF7074',
          dark: '#E64449',
        },
        // Vuexy Warning Orange
        warning: {
          DEFAULT: '#FF9F43',
          light: '#FFB269',
          dark: '#E68F3C',
        },
        // Vuexy Info Cyan
        info: {
          DEFAULT: '#00BAD1',
          light: '#33C8DA',
          dark: '#00A7BC',
        },
        // Light mode backgrounds
        background: {
          DEFAULT: '#F8F7FA',
          paper: '#FFFFFF',
        },
        // Dark mode backgrounds
        dark: {
          DEFAULT: '#25293C',
          paper: '#2F3349',
          lighter: '#373B50',
        },
        // Text colors
        textPrimary: {
          light: 'rgba(47, 43, 61, 0.9)',
          dark: 'rgba(225, 222, 245, 0.9)',
        },
        textSecondary: {
          light: 'rgba(47, 43, 61, 0.7)',
          dark: 'rgba(225, 222, 245, 0.7)',
        },
        // Border colors
        border: {
          light: 'rgba(47, 43, 61, 0.12)',
          dark: 'rgba(225, 222, 245, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 6px 0 rgba(47, 43, 61, 0.14)',
        'card-hover': '0 4px 12px 0 rgba(47, 43, 61, 0.18)',
        'card-dark': '0 2px 6px 0 rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  plugins: [],
};

export default config;
