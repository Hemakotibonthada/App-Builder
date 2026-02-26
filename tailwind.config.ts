import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'builder-bg': '#0a0a0f',
        'builder-surface': '#13131a',
        'builder-elevated': '#1a1a25',
        'builder-border': '#2a2a3a',
        'builder-hover': '#252535',
        'builder-accent': '#6366f1',
        'builder-accent-light': '#818cf8',
        'builder-accent-dark': '#4f46e5',
        'builder-success': '#22c55e',
        'builder-warning': '#f59e0b',
        'builder-error': '#ef4444',
        'builder-info': '#3b82f6',
        'builder-text': '#e2e8f0',
        'builder-text-muted': '#94a3b8',
        'builder-text-dim': '#64748b',
        'glass-white': 'rgba(255, 255, 255, 0.05)',
        'glass-white-10': 'rgba(255, 255, 255, 0.10)',
        'glass-white-20': 'rgba(255, 255, 255, 0.20)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
      },
      borderRadius: {
        'glass': '16px',
        'glass-sm': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        'panel': '280px',
        'panel-lg': '320px',
        'toolbar': '48px',
        'header': '56px',
      },
    },
  },
  plugins: [],
};

export default config;
