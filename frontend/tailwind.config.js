/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme backgrounds
        appBg: '#0B1121',       // The very dark background
        panelBg: '#151C2C',     // The slightly lighter card background
        inputBg: '#F8FAF8',     // Off-white for the booking form
        
        // Neon green accents
        brandGreen: {
          DEFAULT: '#4ADE80',   // Main bright green
          dark: '#22C55E',      // Hover state green
          light: '#86EFAC',     // Muted green for text/badges
        },
        
        // Text colors
        textMuted: '#94A3B8',
      },
      boxShadow: {
        // Custom glowing shadows for the cards and QR code
        'glow': '0 0 15px -3px rgba(74, 222, 128, 0.3)',
        'glow-strong': '0 0 25px -5px rgba(74, 222, 128, 0.5)',
        'glow-border': '0 0 0 1px rgba(74, 222, 128, 0.5), 0 0 10px rgba(74, 222, 128, 0.2)',
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(to right, #22C55E, #4ADE80)',
      }
    },
  },
  plugins: [],
}