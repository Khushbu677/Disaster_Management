/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Core palette from resqnet.html
        'rq-green':       '#4fcf8e',
        'rq-green-dark':  '#21764d',
        'rq-green-light': '#dff8ea',
        'rq-amber':       '#84d4a2',
        'rq-amber-dark':  '#2a6f47',
        'rq-teal':        '#1fa36b',
        'rq-teal-dark':   '#0b5a3b',
        'rq-purple':      '#72c391',
        'rq-gray-900':    '#071811',
        'rq-gray-800':    '#0d2419',
        'rq-gray-700':    '#143324',
        'rq-gray-600':    '#2f5c47',
        'rq-gray-400':    '#79a58f',
        'rq-gray-200':    '#d7eadf',
        'rq-gray-100':    '#f1f8f3',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
      },
      backgroundImage: {
        'rq-hero': 'linear-gradient(160deg, #06140e 0%, #0d2419 40%, #133323 100%)',
        'rq-form': 'radial-gradient(ellipse at top, rgba(79,207,142,0.06) 0%, transparent 60%)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        'fade-in':   'fadeInUp 0.4s ease',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: 1, transform: 'scale(1)' },
          '50%':     { opacity: 0.5, transform: 'scale(1.3)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backdropBlur: { xs: '4px' },
    },
  },
  plugins: [],
};
