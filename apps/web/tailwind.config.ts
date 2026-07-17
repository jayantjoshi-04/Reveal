import type { Config } from 'tailwindcss';

/**
 * REVEAL design tokens, lifted verbatim from the reference specs
 * (Design_Signature_v4 / DataSchema_v2 :root variables).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: '#EC6540',
        'orange-dim': '#f4a98e',
        'orange-bg': '#FBEDE8',
        ink: '#1A1A18',
        black: '#111111',
        cream: '#FAF7F2',
        warm: '#F1EDE6',
        canvas: '#E4E0D8',
        navy: '#193E90',
        'navy-deep': '#142F6E',
        'navy-card': '#1f478f',
        cyan: '#46C2D6',
        steel: '#8a96aa',
        'steel-bg': '#eef1f5',
        mag: '#D6418F',
        gold: '#E8A838',
        green: '#3E9D6B',
        blue: '#1565C0',
        'blue-bg': '#EAF1FA',
        rule: '#E4E0D8',
        mid: '#7d7d74',
        dim: '#a7a79e',
        // Premium neutral accent for the new auth/admin surfaces.
        accent: '#4F46E5',
        'accent-dark': '#4338CA',
        'accent-soft': '#EEF2FF',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)',
        lift: '0 4px 12px rgba(15,23,42,.06), 0 20px 40px -16px rgba(15,23,42,.18)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(24px,-30px) scale(1.08)' },
          '66%': { transform: 'translate(-20px,18px) scale(0.94)' },
        },
        'gradient-pan': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        'progress-stripe': { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '28px 0' } },
      },
      animation: {
        'fade-in': 'fade-in .4s ease both',
        'slide-up': 'slide-up .5s cubic-bezier(.16,1,.3,1) both',
        float: 'float 7s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
