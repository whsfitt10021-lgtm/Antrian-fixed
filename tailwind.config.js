/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          deep: '#00284d',
          mid: '#004a8f',
          glow: '#1e73be'
        },
        cyan: '#0072ce',
        gold: '#d99a35',
        green: '#3fae6f',
        red: '#e0304a',
        surface: {
          1: '#0d2a4d',
          2: '#082038',
          3: '#061627'
        },
        ink: {
          primary: '#f3f6f9',
          secondary: '#c9d8e8',
          tertiary: '#8fa9c4',
          muted: '#5f7793'
        },
        gate: {
          1: '#3577a8',
          2: '#3fae6f',
          3: '#d99a35',
          4: '#6c7f92',
          5: '#c17a3f'
        },
        steel: {
          DEFAULT: '#2b3844',
          light: '#55697a',
          black: '#0a0d10',
          black2: '#131820'
        },
        amber: {
          DEFAULT: '#ffb020',
          glow: 'rgba(255,176,32,.55)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace'],
        stencil: ['"Barlow Condensed"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        panel: '0 1px 3px rgba(0,0,0,.35)',
        'panel-lg': '0 8px 28px rgba(0,0,0,.45)',
        beacon: '0 0 10px rgba(255,176,32,.35)'
      },
      keyframes: {
        beaconSpin: {
          '0%,49%': { opacity: 1 },
          '50%,100%': { opacity: .4 }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        pulseSoft: {
          '0%,100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: .5, transform: 'scale(1.15)' }
        },
        cardFlash: {
          '0%,100%': { backgroundColor: 'rgba(255,255,255,0)' },
          '30%': { backgroundColor: 'rgba(30,115,190,.18)' }
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        beacon: 'beaconSpin 1s steps(2,end) infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        pulseSoft: 'pulseSoft 1.3s ease-in-out infinite',
        cardFlash: 'cardFlash .6s ease-out 2',
        fadeInUp: 'fadeInUp .35s ease-out'
      }
    }
  },
  plugins: []
}
