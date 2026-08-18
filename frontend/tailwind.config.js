/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cobalt: { 50:'#EEF2FF',100:'#C8D9FF',500:'#1A4FD6',600:'#1540B8',700:'#0D2B6E' },
        violet: { 50:'#F3F0FF',400:'#7C5CFC',600:'#5B3FE0' },
        emerald: { 50:'#E8FAF4',400:'#0D9B6A',600:'#085041' },
        midnight: { 800:'#0E1A2E',900:'#060D18',700:'#1A2740',600:'#243350' },
      },
      fontFamily: { mono: ['"DM Mono"','monospace'], sans: ['"DM Sans"','sans-serif'], display: ['Sora','sans-serif'] },
      animation: {
        'count-up': 'countUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'draw-line': 'drawLine 1.2s ease forwards',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        countUp: { from:{ opacity:'0', transform:'translateY(12px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideUp: { from:{ opacity:'0', transform:'translateY(20px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        fadeIn: { from:{ opacity:'0' }, to:{ opacity:'1' } },
        scaleIn: { from:{ opacity:'0', transform:'scale(0.9)' }, to:{ opacity:'1', transform:'scale(1)' } },
        shimmer: { '0%':{ backgroundPosition:'-400px 0' }, '100%':{ backgroundPosition:'400px 0' } },
        pulseRing: { '0%':{ transform:'scale(1)', opacity:'0.8' }, '100%':{ transform:'scale(1.6)', opacity:'0' } },
        float: { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        drawLine: { from:{ strokeDashoffset:'1000' }, to:{ strokeDashoffset:'0' } },
        bounceIn: { '0%':{ transform:'scale(0)', opacity:'0' }, '60%':{ transform:'scale(1.2)' }, '100%':{ transform:'scale(1)', opacity:'1' } },
      }
    }
  },
  plugins: [],
}
