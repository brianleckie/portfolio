// src/components/portfolio/Showcase.jsx
// Bloque de proyecto grande: monitor (desktop) + iPhone superpuesto.
// Se usa para Estación, Mbarete y cada marca del caso de marca.
import React from 'react';
import { Desktop, Phone, Tags, ProjLink } from './Devices';

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
        <div className="bigproj-top" data-reveal>
          {d.index && <span className="proj-index">{d.index}</span>}
          <h3 className="proj-name">{d.nameNode || d.name}</h3>
          {d.role && <span className="proj-role">{d.role}</span>}
        </div>

        {d.badge && (
          <div data-reveal style={{ transitionDelay: '60ms' }}>
            <span className="badge"><span className="dot" />{d.badge}</span>
          </div>
        )}

        <p className="proj-desc" data-reveal style={{ transitionDelay: '100ms' }}>{d.desc}</p>
        {d.note && (
          <p className="proj-note" data-reveal style={{ transitionDelay: '130ms' }}>{d.note}</p>
        )}

        <div className="bigproj-meta" data-reveal style={{ transitionDelay: '170ms' }}>
          {d.metrics &&
            d.metrics.map((m) => (
              <div className="metric" key={m.label}>
                <span className="metric-num">{m.num}</span>
                <span className="metric-label">{m.label}</span>
              </div>
            ))}
          <Tags items={d.tags} />
        </div>

        <div data-reveal style={{ transitionDelay: '220ms' }}>
          <ProjLink href={d.href} label={d.hrefLabel} />
        </div>
      </div>

      <div className="bigproj-visual" data-reveal style={{ transitionDelay: '120ms' }}>
        <Desktop src={d.desktop} alt={`${d.name} desktop`} url={d.desktopUrl} treatment={treatment} />
        {showMobile && d.mobile && (
          <div className="bigproj-phone">
            <Phone src={d.mobile} alt={`${d.name} mobile`} />
          </div>
        )}
      </div>
    </section>
  );
}
