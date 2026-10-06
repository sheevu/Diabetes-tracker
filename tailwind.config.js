/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#E0F2F7',
          100: '#B8E2ED',
          500: '#219EBC',
          600: '#1F8FA3',
          700: '#167C91',
          900: '#0F4D5C'
        },
        lime: {
          400: '#C6E423',
          500: '#BEEA00',
          600: '#A3CA00'
        },
        navy: {
          800: '#0F1A30',
          900: '#0A1124',
          950: '#060B18'
        }
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px'
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pop': 'pop 0.3s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out'
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
