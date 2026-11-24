---
title: "Estación de Carretera"
summary: "Marketplace y showroom digital para los emprendedores de Hohenau, basado en el modelo japonés Michi-no-eki."
category: ["web", "sistemas"]
status: "en-produccion"
featured: true
order: 3
clientNamePublic: false
clientGeneric: "Municipalidad de Hohenau, iniciativa pública"
role: "Project Lead"
stack: ["React", "Python", "FastAPI", "PostgreSQL", "REST API"]
highlights:
  - "Marketplace que conecta artesanos y productores locales con compradores"
  - "Dashboard de vendedor para gestión de inventario y pedidos"
  - "Autenticación por roles (admin, vendedor, comprador) sobre una API REST en FastAPI"
demoUrl: "https://www.estaciondecarretera.store"
year: 2024
accent: "#d9f28f"
shots:
  default:
    waitFor: 'main h1:not(:has-text("Estamos mejorando la plataforma"))'
    hideText:
      - 'text=/^Inaugurada\b/i'
    alt:
      path: "/showroom"
      waitFor: 'main h1:not(:has-text("Estamos mejorando la plataforma"))'
---

## Contexto

La Municipalidad de Hohenau impulsó una iniciativa para digitalizar la venta de productos locales: artesanías, alimentos, productos del campo. El modelo es el *Michi-no-eki* japonés: estaciones de carretera que funcionan como vitrinas de la producción regional.

## Problema

Los emprendedores locales no tenían un canal digital unificado para mostrar y vender sus productos. Cada uno vendía por separado, sin visibilidad conjunta ni herramienta para gestionar pedidos.

## Qué construí

Un marketplace completo: catálogo público donde los compradores exploran por categoría y vendedor, más un dashboard privado para que cada emprendedor gestione su inventario y vea sus pedidos. El backend en FastAPI maneja la autenticación por roles (admin, vendedor, comprador) y la API REST.
