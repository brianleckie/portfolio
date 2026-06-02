// src/components/portfolio/Hero.jsx
import React from 'react';
import { Arrow } from './Devices';

export default function Hero({ data }) {
  return (
    <header className="hero">
      <div className="hero-glow" />
      <div className="hero-inner">
        <div className="hero-stack-line">
          <span className="hero-eyebrow" data-reveal>{data.eyebrow}</span>
          <h1 className="hero-h1" data-reveal style={{ transitionDelay: '60ms' }}>
            {data.headline}
          </h1>
          <p className="hero-sub" data-reveal style={{ transitionDelay: '120ms' }}>
            {data.subtitle}
          </p>
          <div className="hero-tags" data-reveal style={{ transitionDelay: '180ms' }}>
            {data.tags.map((tech) => (
              <span className="tag" key={tech}>{tech}</span>
            ))}
          </div>
          <div className="hero-cta" data-reveal style={{ transitionDelay: '240ms' }}>
            <a className="btn-primary" href="#proyectos">Ver proyectos <Arrow /></a>
            <a className="btn-ghost" href="#contacto">Contactar</a>
          </div>
        </div>
      </div>
    </header>
  );
}
