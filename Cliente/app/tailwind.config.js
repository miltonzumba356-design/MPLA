/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cne: {
          blue:     '#31A7D8',
          dark:     '#0E6B8F',
          mid:      '#1E8FB5',
          light:    '#E4F5FB',
          xlight:   '#F0FAFD',
          sidebar:  '#0A5570',
          gold:     '#B8960C',
          'gold-dark':  '#8A6E08',
          'gold-light': '#FBF6E3',
          text:     '#0D3D52',
          muted:    '#64748B',
          bg:       '#F5F5F5',
          border:   '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06)',
        hover: '0 4px 16px rgba(49,167,216,0.15)',
        blue:  '0 4px 20px rgba(49,167,216,0.30)',
        gold:  '0 4px 20px rgba(184,150,12,0.25)',
      },
    },
  },
  plugins: [],
}
