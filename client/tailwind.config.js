/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
        },
        bg: {
          app: 'var(--bg-app)',
          content: 'var(--bg-content)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          headings: 'var(--ink-headings)',
        },
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          ink: 'var(--accent-ink)',
        },
        status: {
          success: {
            bg: 'var(--status-success-bg)',
            text: 'var(--status-success-text)',
          },
          warning: {
            bg: 'var(--status-warning-bg)',
            text: 'var(--status-warning-text)',
          },
          danger: {
            bg: 'var(--status-danger-bg)',
            text: 'var(--status-danger-text)',
          },
        },
      },
    },
  },
  plugins: [],
}
