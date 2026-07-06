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
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
