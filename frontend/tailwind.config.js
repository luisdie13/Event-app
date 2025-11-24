/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul principal brillante (#188AF5) - Para CTAs y elementos importantes
        primary: {
          50: '#e8f4fe',
          100: '#c0e2fd',
          200: '#98d1fc',
          300: '#70bffb',
          400: '#48aefa',
          500: '#188AF5',
          600: '#136ec4',
          700: '#0e5393',
          800: '#093762',
          900: '#051c31',
        },
        // Azul medio (#3682C9) - Para enlaces y elementos secundarios
        secondary: {
          50: '#e6f2fb',
          100: '#c2dff5',
          200: '#9dcbef',
          300: '#78b8e9',
          400: '#53a4e3',
          500: '#3682C9',
          600: '#2b68a0',
          700: '#204e77',
          800: '#16344e',
          900: '#0b1a25',
        },
        // Azul oscuro (#0054A3) - Para fondos y headers
        accent: {
          50: '#e6f0fa',
          100: '#b3d4f0',
          200: '#80b8e6',
          300: '#4d9cdc',
          400: '#1a80d2',
          500: '#0054A3',
          600: '#004382',
          700: '#003261',
          800: '#002140',
          900: '#001020',
        },
        // Gris azulado (#465F75) - Para textos y elementos neutrales
        neutral: {
          50: '#f5f6f7',
          100: '#e8eaec',
          200: '#d1d5d9',
          300: '#bac0c6',
          400: '#a3abb3',
          500: '#465F75',
          600: '#384c5e',
          700: '#2a3946',
          800: '#1c262f',
          900: '#0e1317',
        },
        // Gris oscuro (#39424A) - Para texto principal
        slate: {
          50: '#f1f2f2',
          100: '#dcdede',
          200: '#b9bcbe',
          300: '#969b9e',
          400: '#73797e',
          500: '#39424A',
          600: '#2e353b',
          700: '#22282c',
          800: '#171a1e',
          900: '#0b0d0f',
        },
        // Negro azulado (#2C3033) - Para fondos oscuros
        dark: {
          50: '#f0f0f1',
          100: '#d9dadb',
          200: '#b3b5b7',
          300: '#8d9093',
          400: '#676b6f',
          500: '#2C3033',
          600: '#232629',
          700: '#1a1d1f',
          800: '#121314',
          900: '#09090a',
        },
      },
    },
  },
  plugins: [],
}
