// src/components/portfolio/Portfolio.jsx
// Composición de todo el rediseño. Montá este componente (o copiá su contenido
// dentro de tu App.jsx, entre <Navbar/> y donde corresponda).
import React from 'react';
import * as data from '../../data/projects';
import { Reveal } from './Reveal';

import Hero from './Hero';
import Showcase from './Showcase';
import BrandCase from './BrandCase';
import ProjectRow from './ProjectRow';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';

import '../../styles/portfolio.css';

export default function Portfolio() {
  // 'monitor' | 'navegador' | 'flotante' — en el prototipo era un Tweak.
  const treatment = 'monitor';
  const showMobile = true;

  return (
    <>
      <Hero data={data.hero} />

      <main className="projects wrap" id="proyectos">
        <div className="sec-head">
          <Reveal><span className="eyebrow">Trabajo selecto</span></Reveal>
          <Reveal delay={0.06}><h2 className="sec-title">Proyectos</h2></Reveal>
          <Reveal delay={0.12}>
            <p className="sec-desc">
              Productos construidos de cero a producción — arquitectura, diseño y entrega end-to-end.
            </p>
          </Reveal>
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
