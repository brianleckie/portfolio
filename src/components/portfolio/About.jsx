// src/components/portfolio/About.jsx
import React from 'react';
import { Reveal } from './Reveal';

export default function About({ data }) {
  const d = data;
  return (
    <section className="about wrap" id="about">
      <Reveal>
        <span className="eyebrow">Sobre mí</span>
      </Reveal>
      <div className="about-grid">
        <Reveal delay={0.05}>
          <img className="about-photo" src={d.photo} alt={d.name} />
        </Reveal>
        <div className="about-text">
          <Reveal><h3 className="about-name">{d.name}</h3></Reveal>
          <Reveal delay={0.05}><p className="about-role">{d.role}</p></Reveal>
          <Reveal delay={0.11}><p className="about-bio">{d.bio}</p></Reveal>
          <Reveal delay={0.17}>
            <div className="about-links">
              {d.links.map((l) => (
                <a className="proj-link" key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
