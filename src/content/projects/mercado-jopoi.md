---
title: "Mercado Jopoi"
subtitle: "marketplace universitario"
summary: "Marketplace C2C para la comunidad universitaria: libros, apuntes, equipos y servicios entre estudiantes."
category: ["sistemas", "web"]
status: "en-produccion"
featured: false
order: 9
clientNamePublic: false
clientGeneric: "Proyecto propio"
role: "Full-Stack Developer"
stack: ["React", "FastAPI", "PostgreSQL", "Python"]
highlights:
  - "Feed dinámico con WebSockets para actualizaciones en tiempo real"
  - "Inventario en vivo y chat entre comprador y vendedor"
  - "Segmentado por facultad para relevancia local"
demoUrl: "https://www.mercadojopoi.lat"
year: 2024
accent: "#c6d7ff"
shots:
  default:
    click: 'button:text-is("¡Entendido, explorar!")'
    waitFor: "main h1"
    delay: 700
    css: |
      @media (min-width: 768px) {
        main section:has(h1) { min-height: calc(100dvh - 86px); align-content: center; }
      }
    alt:
      waitFor: 'text=/^[1-9][0-9]* publicaciones?$/'
      scrollTo: 'h2:text-is("Publicaciones Recientes")'
---

TODO: caso de estudio.
