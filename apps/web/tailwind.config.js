/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        status: {
          progress: 'var(--color-status-progress)',
          completed: 'var(--color-status-completed)',
          'not-started': 'var(--color-status-not-started)',
          cancelled: 'var(--color-status-cancelled)',
          overdue: 'var(--color-status-overdue)',
        },
        priority: {
          urgent: 'var(--color-priority-urgent)',
          high: 'var(--color-priority-high)',
          medium: 'var(--color-priority-medium)',
          low: 'var(--color-priority-low)',
        },
        background: {
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        border: {
          secondary: 'var(--color-border-secondary)',
          tertiary: 'var(--color-border-tertiary)',
        }
      },
      borderRadius: {
        'button': '7px',
        'input': '8px',
        'card': '12px',
        'nav': '7px',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      }
    },
  },
  plugins: [],
};
