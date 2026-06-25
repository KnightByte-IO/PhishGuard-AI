/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Custom cybersecurity dark theme palette
        cyber: {
          dark: '#0a0e17',
          darker: '#060912',
          card: '#111827',
          border: '#1f2937',
          accent: '#06b6d4',
          accentHover: '#0891b2',
          danger: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
          muted: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
