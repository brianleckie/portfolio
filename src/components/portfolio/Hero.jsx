import React from 'react';
import { motion } from 'framer-motion';
import { Arrow } from './Devices';

const EASE = [0.22, 0.61, 0.36, 1];

export default function Hero({ data }) {
  return (
    <header className="hero">
      <div className="hero-glow" />
      <div className="hero-inner">
        <div className="hero-stack-line">
          <motion.span
            className="hero-eyebrow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
          >
            {data.eyebrow}
          </motion.span>

          <motion.h1
            className="hero-h1"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.22 }}
          >
            {data.headline}
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.52 }}
          >
            {data.subtitle}
          </motion.p>

          <motion.div
            className="hero-tags"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.68 }}
          >
            {data.tags.map((tech) => (
              <span className="tag" key={tech}>{tech}</span>
            ))}
          </motion.div>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.82 }}
          >
            <a className="btn-primary" href="#proyectos">Ver proyectos <Arrow /></a>
            <a className="btn-ghost" href="#contacto">Contactar</a>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
