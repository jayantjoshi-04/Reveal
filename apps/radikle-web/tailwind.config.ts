import type { Config } from 'tailwindcss';

/**
 * Radikle design tokens — lifted verbatim from the Figma file
 * "Radikle Website (Copy)" (fkTFlDxESzWHQGyjEdDoQn).
 * Colours and type are the exact values read from the design layers.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand palette (exact hex from Figma) ──────────────────────
        ink: '#0b162c', // body / navy text
        teal: '#0b4e4f', // primary headings
        deep: '#11254d', // secondary deep-blue headings
        olive: '#bfcc48', // olive-green section band
        cream: '#f6f4e5', // warm cream section band (Home)
        peach: '#fff4e4', // warm peach section band (About)
        sky: '#b2dbf7', // sky-blue hero / footer band (used at 60% opacity)
        mist: '#d1e9fa', // lighter blue rounded section (Reveal)
        violet: '#a085e4', // purple footer band (Reveal, used at 60% opacity)
        azure: '#3da1e5', // blue accent
      },
      fontFamily: {
        // Headings use Raleway; body & nav use Host Grotesk (both Google Fonts).
        display: ['Raleway', 'system-ui', 'sans-serif'],
        sans: ['"Host Grotesk"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        // Figma tracks are tight negatives; expose the ones actually used.
        tightest: '-0.528px',
        tighter: '-0.44px',
        tight2: '-0.352px',
        tight1: '-0.264px',
        tight0: '-0.176px',
        logo: '1.2px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        sway: {
          '0%,100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.16,1,.3,1) both',
        float: 'float 6s ease-in-out infinite',
        sway: 'sway 7s ease-in-out infinite',
        breathe: 'breathe 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
