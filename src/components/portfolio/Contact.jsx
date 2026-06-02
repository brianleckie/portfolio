// src/components/portfolio/Contact.jsx
import React from 'react';
import { Arrow } from './Devices';

export default function Contact({ data }) {
  const d = data;
  return (
    <section className="contact" id="contacto">
      <div className="contact-glow" />
      <div className="contact-inner">
        <p className="contact-eyebrow" data-reveal>{d.eyebrow}</p>
        <h2 className="contact-title" data-reveal style={{ transitionDelay: '60ms' }}>{d.title}</h2>
        <div className="contact-actions" data-reveal style={{ transitionDelay: '120ms' }}>
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
      </div>
    </section>
  );
}
