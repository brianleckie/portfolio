/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background:          '#0a0a0a',
        surface:             '#111111',
        border:              '#1f1f1f',
        'border-subtle':     '#161616',
        muted:               '#6b6b6b',
        subtle:              '#3a3a3a',
        foreground:          '#f5f5f5',
        'foreground-muted':  '#a0a0a0',
        accent:              '#ffffff',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        heading:  ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        subhead:  ['clamp(1rem, 2vw, 1.25rem)',  { lineHeight: '1.6',  letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '128': '32rem',
      },
      maxWidth: {
        content: '72rem',
      },
      borderRadius: {
        sm:      '4px',
        DEFAULT: '6px',
        md:      '8px',
        lg:      '12px',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
        'glow-sm':  '0 0 20px rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}
