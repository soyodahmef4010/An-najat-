module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf0dc',
          200: '#bce1bc',
          300: '#8fcc8f',
          400: '#5aad5a',
          500: '#3a8d3a', // Islamic Green
          600: '#2d7a2d',
          700: '#256325',
          800: '#215121',
          900: '#1d441d',
        },
        gold: {
          50: '#fffdf0',
          100: '#fef9d7',
          200: '#fdf0ae',
          300: '#fbe175',
          400: '#f8cb3d',
          500: '#f5b312',
          600: '#d6970a',
          700: '#b17909',
          800: '#8f610e',
          900: '#775111',
        }
      },
      fontFamily: {
        'bangla': ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
        'arabic': ['"Scheherazade New"', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-in'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'pulse-gold': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}