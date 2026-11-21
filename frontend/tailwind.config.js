/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070b14',
          card: '#0d1527',
          border: '#1b2a47',
          hover: '#18253f',
          cyan: '#00f2fe',
          cyanGlow: 'rgba(0, 242, 254, 0.25)',
          purple: '#8b5cf6',
          purpleGlow: 'rgba(139, 92, 246, 0.25)',
          red: '#ef4444',
          orange: '#f59e0b',
          green: '#10b981',
          textMuted: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.35)',
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.35)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.35)'
      }
    },
  },
  plugins: [],
}
