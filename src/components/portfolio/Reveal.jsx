import { motion } from 'framer-motion';

const EASE = [0.22, 0.61, 0.36, 1];
export const VIEWPORT = { once: true, margin: '0px 0px -60px 0px' };

export function Reveal({ children, delay = 0, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
