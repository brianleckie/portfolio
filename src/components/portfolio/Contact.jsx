// src/components/portfolio/Contact.jsx
import React from 'react';
import { Arrow } from './Devices';
import { Reveal } from './Reveal';

export default function Contact({ data }) {
  const d = data;
  return (
    <section className="contact" id="contacto">
      <div className="contact-glow" />
      <div className="contact-inner">
        <Reveal><p className="contact-eyebrow">{d.eyebrow}</p></Reveal>
        <Reveal delay={0.06}><h2 className="contact-title">{d.title}</h2></Reveal>
        <Reveal delay={0.12}>
          <div className="contact-actions">
            {d.actions.map((a) => (
              <a
                key={a.label}
                className={a.primary ? 'btn-primary' : 'btn-ghost'}
                href={a.href}
                target={a.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                {a.label}
                {a.primary && <Arrow />}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
