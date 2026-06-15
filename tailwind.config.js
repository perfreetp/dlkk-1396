/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFBF5',
          100: '#FFF8F0',
          200: '#FFEED9',
        },
        warm: {
          300: '#FFCBA4',
          400: '#FFB366',
          500: '#FF9933',
          600: '#E67A00',
        },
        mint: {
          300: '#A8E4CC',
          400: '#7FD1AE',
          500: '#52BE8E',
        },
        tomato: {
          400: '#FF8787',
          500: '#FF6B6B',
          600: '#E03131',
        },
        yolk: {
          400: '#FFE066',
          500: '#FFD93D',
        },
        lavender: {
          300: '#D8C8FF',
          400: '#C9B1FF',
        }
      },
      fontFamily: {
        happy: ['"ZCOOL KuaiLe"', '"Ma Shan Zheng"', 'cursive', 'sans-serif'],
        body: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'candy': '0 6px 0 rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.08)',
        'candy-sm': '0 3px 0 rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.06)',
        'soft': '0 4px 20px rgba(255,179,102,0.2)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [],
}
