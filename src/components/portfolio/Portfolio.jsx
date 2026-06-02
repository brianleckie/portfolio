// src/components/portfolio/Portfolio.jsx
// Composición de todo el rediseño. Montá este componente (o copiá su contenido
// dentro de tu App.jsx, entre <Navbar/> y donde corresponda).
import React from 'react';
import { useReveal } from '../../hooks/useReveal';
import * as data from '../../data/projects';

import Hero from './Hero';
import Showcase from './Showcase';
import BrandCase from './BrandCase';
import ProjectRow from './ProjectRow';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';

import '../../styles/portfolio.css';

export default function Portfolio() {
  useReveal();

  // 'monitor' | 'navegador' | 'flotante' — en el prototipo era un Tweak.
  const treatment = 'monitor';
  const showMobile = true;

  return (
    <>
      <Hero data={data.hero} />

      <main className="projects wrap" id="proyectos">
        <div className="sec-head">
          <div data-reveal><span className="eyebrow">Trabajo selecto</span></div>
          <h2 className="sec-title" data-reveal style={{ transitionDelay: '60ms' }}>Proyectos</h2>
          <p className="sec-desc" data-reveal style={{ transitionDelay: '120ms' }}>
            Productos construidos de cero a producción — arquitectura, diseño y entrega end-to-end.
          </p>
        </div>

        <div className="proj-stack">
          <Showcase data={data.projects[0]} treatment={treatment} showMobile={showMobile} />
          <Showcase data={data.projects[1]} treatment={treatment} showMobile={showMobile} />
          <BrandCase data={data.brandcase} treatment={treatment} showMobile={showMobile} />
          <ProjectRow data={data.row} treatment={treatment} reverse />
        </div>
      </main>

      <About data={data.about} />
      <Contact data={data.contact} />
      <Footer data={data.footer} />
    </>
  );
}
