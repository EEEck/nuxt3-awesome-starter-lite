import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.{js,ts,vue}',
    './error.{js,ts,vue}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          50: '#f2f3ff',
          100: '#e3e6ff',
          200: '#c2c6ff',
          300: '#9aa0ff',
          400: '#6d75ff',
          500: '#4d56ff',
          600: '#2f38f5',
          700: '#2027c3',
          800: '#181e97',
          900: '#161d75',
        },
      },
      boxShadow: {
        subtle: '0 10px 40px -20px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}
