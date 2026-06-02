// src/components/portfolio/BrandCase.jsx
// Caso "Presencia digital de marca": header + dos Showcase a ancho completo.
import React from 'react';
import Showcase from './Showcase';

export default function BrandCase({ data, treatment = 'monitor', showMobile = true }) {
  const d = data;
  return (
    <section className="brandcase" id="marca">
      <div className="brandcase-head">
        <span className="brandcase-eyebrow" data-reveal>
          <span style={{ color: 'var(--fg-muted)', fontWeight: 600 }}>03</span> · {d.eyebrow}
        </span>
        <h3 className="brandcase-title" data-reveal style={{ transitionDelay: '60ms' }}>{d.title}</h3>
        <p className="brandcase-sub" data-reveal style={{ transitionDelay: '110ms' }}>{d.sub}</p>
      </div>

      <div className="brandcase-stack">
        {d.brands.map((b) => {
          // Felinas usa una marca tipográfica especial (acento teal).
          const nameNode =
            b.key === 'felinas' ? (
              <span>
                <span className="felinas-mark">felinas</span>
                <span style={{ color: b.accent }}>.</span>
              </span>
            ) : (
              b.name
            );

          const sd = {
            key: b.key,
            accent: b.accent,
            accentSoft: b.accentSoft || 'rgba(255,255,255,0.05)',
            name: b.name,
            nameNode,
            role: b.tagline,
            desc: b.desc,
            tags: b.tags,
            href: b.href,
            hrefLabel: b.key,
            desktop: b.desktop,
            desktopUrl: b.desktopUrl,
            mobile: b.mobile,
          };
          return <Showcase data={sd} treatment={treatment} showMobile={showMobile} key={b.key} />;
        })}
      </div>
    </section>
  );
}
