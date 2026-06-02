// src/components/portfolio/About.jsx
import React from 'react';

export default function About({ data }) {
  const d = data;
  return (
    <section className="about wrap" id="about">
      <div data-reveal><span className="eyebrow">Sobre mí</span></div>
      <div className="about-grid">
        <div data-reveal>
          {/* Reemplazá por tu foto. En el prototipo HTML esto es un drop-slot. */}
          <img className="about-photo" src={d.photo} alt={d.name} />
        </div>
        <div className="about-text">
          <h3 className="about-name" data-reveal>{d.name}</h3>
          <p className="about-role" data-reveal style={{ transitionDelay: '50ms' }}>{d.role}</p>
          <p className="about-bio" data-reveal style={{ transitionDelay: '110ms' }}>{d.bio}</p>
          <div className="about-links" data-reveal style={{ transitionDelay: '170ms' }}>
            {d.links.map((l) => (
              <a className="proj-link" key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
