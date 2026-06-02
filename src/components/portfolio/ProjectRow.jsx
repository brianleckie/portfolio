// src/components/portfolio/ProjectRow.jsx
// Proyecto en fila estándar (solo desktop) — Mercado Jopoi.
import React from 'react';
import { Desktop, Tags, ProjLink } from './Devices';

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
          <div className="bigproj-top" data-reveal>
            <span className="proj-index">{d.index}</span>
            <h3 className="proj-name">{d.name}</h3>
          </div>
          <div data-reveal style={{ transitionDelay: '60ms' }}>
            <span className="proj-role">{d.role}</span>
          </div>
          <p className="proj-desc" data-reveal style={{ transitionDelay: '110ms' }}>{d.desc}</p>
          <div data-reveal style={{ transitionDelay: '160ms' }}><Tags items={d.tags} /></div>
          <div data-reveal style={{ transitionDelay: '210ms' }}>
            <ProjLink href={d.href} label={d.hrefLabel} />
          </div>
        </div>
        <div className="row-visual" data-reveal style={{ transitionDelay: '120ms' }}>
          <Desktop src={d.desktop} alt={d.name} url={d.desktopUrl} treatment={treatment} />
        </div>
      </div>
    </section>
  );
}
