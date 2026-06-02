// src/hooks/useReveal.js
import { useEffect } from 'react';

/**
 * Activa la animación reveal-on-scroll para todos los elementos con [data-reveal]
 * dentro del subárbol montado. Agrega la clase `.in` al entrar en viewport.
 * Llamalo UNA vez en el componente raíz del portfolio (Portfolio.jsx).
 *
 * Si preferís framer-motion (ya está en tu repo), podés reemplazar esto por
 * <motion.div initial={{opacity:0,y:26}} whileInView={{opacity:1,y:0}} viewport={{once:true}} />
 * en cada bloque. El CSS .in/[data-reveal] queda como fallback inofensivo.
 */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -7% 0px' }
    );
    document.querySelectorAll('[data-reveal]:not(.in)').forEach((n) => io.observe(n));
    // Safety: si algo no dispara, revelar igual.
    const safety = setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.in)').forEach((n) => n.classList.add('in'));
    }, 1600);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);
}
