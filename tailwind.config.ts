import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        paper: '#fafafa',
        pink: {
          50:  '#fff0f7',
          100: '#ffd9ec',
          200: '#ffb3d9',
          300: '#ff84bf',
          400: '#ff58a8',
          500: '#ff2d87',
          600: '#e6116c',
          700: '#b30a52',
          800: '#7d063a',
          900: '#4a0322',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"VT323"', '"Space Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        brutal: '6px 6px 0 0 #0a0a0a',
        'brutal-sm': '3px 3px 0 0 #0a0a0a',
        'brutal-pink': '6px 6px 0 0 #ff2d87',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-1px, 1px)' },
          '40%': { transform: 'translate(1px, -1px)' },
          '60%': { transform: 'translate(-1px, -1px)' },
          '80%': { transform: 'translate(1px, 1px)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        glitch: 'glitch 2.5s infinite',
        flicker: 'flicker 4s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
