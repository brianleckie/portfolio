// src/components/portfolio/ProjectRow.jsx
// Proyecto en fila estándar (solo desktop) — Mercado Jopoi.
import React from 'react';
import { motion } from 'framer-motion';
import { Desktop, Tags, ProjLink } from './Devices';
import { Reveal, VIEWPORT } from './Reveal';

const EASE = [0.22, 0.61, 0.36, 1];

export default function ProjectRow({ data, treatment = 'monitor', reverse = true }) {
  const d = data;
  return (
    <section
      className="proj"
      id={d.key}
      style={{ '--accent': d.accent, '--accent-soft': d.accentSoft }}
    >
      <div className="proj-glow" />
      <div className={`row-grid ${reverse ? 'reverse' : ''}`}>
        <div className="row-text">
          <Reveal>
            <div className="bigproj-top">
              <span className="proj-index">{d.index}</span>
              <h3 className="proj-name">{d.name}</h3>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <span className="proj-role">{d.role}</span>
          </Reveal>
          <Reveal delay={0.11}>
            <p className="proj-desc">{d.desc}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <Tags items={d.tags} />
          </Reveal>
          <Reveal delay={0.21} style={{ alignSelf: 'flex-start' }}>
            <ProjLink href={d.href} label={d.hrefLabel} />
          </Reveal>
        </div>
        <motion.div
          className="row-visual"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.9, ease: EASE, delay: 0.12 }}
        >
          <Desktop src={d.desktop} alt={d.name} url={d.desktopUrl} treatment={treatment} />
        </motion.div>
      </div>
    </section>
  );
}
