// src/components/portfolio/Showcase.jsx
// Bloque de proyecto grande: monitor (desktop) + iPhone superpuesto.
// Se usa para Estación, Mbarete y cada marca del caso de marca.
import React from 'react';
import { motion } from 'framer-motion';
import { Desktop, Phone, Tags, ProjLink } from './Devices';
import { Reveal, VIEWPORT } from './Reveal';

const EASE = [0.22, 0.61, 0.36, 1];

export default function Showcase({ data, treatment = 'monitor', showMobile = true }) {
  const d = data;
  return (
    <section
      className="proj bigproj"
      id={d.key}
      style={{ '--accent': d.accent, '--accent-soft': d.accentSoft }}
    >
      <div className="proj-glow" />

      <div className="bigproj-head">
        <Reveal>
          <div className="bigproj-top">
            {d.index && <span className="proj-index">{d.index}</span>}
            <h3 className="proj-name">{d.nameNode || d.name}</h3>
            {d.role && <span className="proj-role">{d.role}</span>}
          </div>
        </Reveal>

        {d.badge && (
          <Reveal delay={0.06} style={{ alignSelf: 'flex-start' }}>
            <span className="badge"><span className="dot" />{d.badge}</span>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <p className="proj-desc">{d.desc}</p>
        </Reveal>

        {d.note && (
          <Reveal delay={0.13}>
            <p className="proj-note">{d.note}</p>
          </Reveal>
        )}

        <Reveal delay={0.17}>
          <div className="bigproj-meta">
            {d.metrics &&
              d.metrics.map((m) => (
                <div className="metric" key={m.label}>
                  <span className="metric-num">{m.num}</span>
                  <span className="metric-label">{m.label}</span>
                </div>
              ))}
            <Tags items={d.tags} />
          </div>
        </Reveal>

        <Reveal delay={0.22} style={{ alignSelf: 'flex-start' }}>
          <ProjLink href={d.href} label={d.hrefLabel} />
        </Reveal>
      </div>

      <motion.div
        className="bigproj-visual"
        initial={{ opacity: 0, y: 36, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.95, ease: EASE, delay: 0.1 }}
      >
        <Desktop src={d.desktop} alt={`${d.name} desktop`} url={d.desktopUrl} treatment={treatment} />
        {showMobile && d.mobile && (
          <div className="bigproj-phone">
            <Phone src={d.mobile} alt={`${d.name} mobile`} />
          </div>
        )}
      </motion.div>
    </section>
  );
}
