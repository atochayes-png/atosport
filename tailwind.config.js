/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sport: {
          dark: '#070A0F',       // Fondo principal
          card: '#0B0F17',       // Contenedores / tarjetas
          cardHover: '#111723',  // Hover tarjetas
          cardActive: '#151D2C', // Active cards
          border: '#1E293B',     // Bordes sutiles (border-slate-800)
          borderLight: '#334155',
          text: '#E2E8F0',       // Textos principales
          muted: '#94A3B8',      // Textos secundarios
          emerald: {
            DEFAULT: '#10B981',  // Acento de acción primario
            dark: '#059669',     // Acento hover/dark
            light: '#34D399',    // Acento highlights
            glow: 'rgba(16, 185, 129, 0.15)',
          },
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
};
