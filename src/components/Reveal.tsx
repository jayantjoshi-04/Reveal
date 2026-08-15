import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  /** Positioning/typography classes for the outer (static) box. */
  className?: string;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Travel distance in px for the fade-up. */
  y?: number;
};

/**
 * Scroll-in fade-up. The outer element keeps the (absolute) positioning +
 * typography classes untouched; only the inner element is transformed, so this
 * never clashes with Tailwind transforms like `-translate-x-1/2` on the box.
 */
export function Reveal({ children, className, delay = 0, y = 22 }: RevealProps) {
  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
