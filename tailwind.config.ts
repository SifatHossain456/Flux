import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        flux: {
          bg: '#050A14',
          card: '#080F1E',
          blue: '#0052FF',
          'blue-light': '#4D8EFF',
          'blue-dim': 'rgba(0,82,255,0.08)',
          'blue-border': 'rgba(0,82,255,0.18)',
          text: '#E8F0FF',
          muted: '#6B8DB8',
          success: '#00C896',
          danger: '#FF4D58',
          warn: '#FFB800',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glow: { '0%,100%': { boxShadow: '0 0 20px rgba(0,82,255,0.2)' }, '50%': { boxShadow: '0 0 40px rgba(0,82,255,0.5)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};

export default config;
