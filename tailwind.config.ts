import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        flux: {
          bg:           '#050A14',
          card:         '#080F1E',
          blue:         '#0052FF',
          'blue-light': '#4D8EFF',
          'blue-dim':   'rgba(0,82,255,0.08)',
          'blue-border':'rgba(0,82,255,0.18)',
          purple:       '#7C3AED',
          'purple-dim': 'rgba(124,58,237,0.1)',
          cyan:         '#06B6D4',
          text:         '#E8F0FF',
          'text-2':     '#CBD5E1',
          muted:        '#6B8DB8',
          success:      '#10B981',
          danger:       '#EF4444',
          warn:         '#F59E0B',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(0,82,255,0.4), 0 0 60px rgba(0,82,255,0.15)',
        'glow-blue-sm':'0 0 10px rgba(0,82,255,0.35)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover':  '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,82,255,0.1)',
      },
      animation: {
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-slow':  'bounce 3s ease-in-out infinite',
        'fade-up':      'fadeUp 0.4s ease-out both',
        'scale-in':     'scaleIn 0.3s ease-out both',
        'count-up':     'countUp 0.5s ease-out both',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity:'0', transform:'translateY(10px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        scaleIn:  { '0%': { opacity:'0', transform:'scale(0.96)' }, '100%': { opacity:'1', transform:'scale(1)' } },
        countUp:  { '0%': { opacity:'0', transform:'translateY(6px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
