import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Asset } from './Asset';
import { A } from '../lib/assets';

/**
 * The hero seed illustration. Two composed motions, kept subtle so the design
 * reads exactly as in Figma:
 *   1. a slow idle float (CSS keyframe on the inner box), and
 *   2. a gentle cursor parallax (spring-eased) on the wrapper.
 * Positioned at the exact Figma coordinates (node 1:9).
 */
export function HeroSeed() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 55, damping: 16 });
  const y = useSpring(my, { stiffness: 55, damping: 16 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx.set(((e.clientX - cx) / cx) * 16);
      my.set(((e.clientY - cy) / cy) * 12);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my]);

  return (
    <div className="absolute left-[calc(41.67%_+_62px)] top-[416px] h-[167px] w-[116px]">
      <motion.div style={{ x, y }} className="relative h-full w-full">
        <div className="relative h-full w-full animate-float">
          <Asset src={A.seedCluster} alt="seed" />
        </div>
      </motion.div>
    </div>
  );
}
