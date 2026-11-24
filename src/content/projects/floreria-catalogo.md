---
title: "Catálogo web para florerías"
subtitle: "un producto, dos clientes"
summary: "Catálogo con fotos y precios, pedido por WhatsApp y panel de gestión de productos, desarrollado para una florería y adaptado después para una segunda."
category: ["web"]
status: "entregado"
featured: true
order: 2
clientNamePublic: false
clientGeneric: "Florerías con sucursales en Paraguay"
role: "Diseño + desarrollo completo"
stack: ["Vue 3", "Vite"]
highlights:
  - "Catálogo con fotos, precios y disponibilidad; checkout directo por WhatsApp"
  - "Panel de administración para carga y baja de productos sin tocar código"
  - "Mantenimiento mensual incluido en el precio"
  - "Desarrollado primero para una florería de Hohenau, después rediseñado y vendido a una segunda"
links:
  - label: "Rocío Florería"
    url: "https://rociofloreria.vercel.app"
  - label: "Ornella Florería"
    url: "https://ornella-floreria.vercel.app"
preview:
  desktop: ornella # desktop-ornella.webp en el marco de navegador (pendiente de capturar)
  mobile: rocio    # mobile-rocio.webp en el teléfono
year: 2024
accent: "#ffb7d5"
shots:
  rocio:
    waitFor: "h1"
    stickyBottom: ".whatsapp-float"
    alt:
      path: "/catalogo"
      waitFor: 'a[href^="/p/"]'
      scrollTo: "main .product-card"
      css: |
        main .product-card { opacity: 1 !important; transform: none !important; scroll-margin-top: 115px; }
        @media (max-width: 767px) { main .product-card { scroll-margin-top: 450px; } }
  ornella:
    waitFor: "main h1"
    alt:
      path: "/catalogo"
      waitFor: 'a[href^="/p/"]'
---

## Contexto

Una florería con sucursales en Hohenau y Mariano Roque Alonso necesitaba mostrar sus productos online y recibir pedidos sin complicar la operación del día a día.

## Problema

Los clientes preguntaban precios por WhatsApp uno a uno. No había forma de que el negocio mostrara su catálogo actualizado, y actualizar los precios requería llamar al desarrollador.

## Qué construí

Un catálogo web con fotos, precios y estado de disponibilidad. El cliente puede ver los productos, armar su pedido y mandarlo directo por WhatsApp con un clic. El negocio actualiza productos desde un panel sin tocar código.

## Decisiones técnicas

El stack Vue 3 + Vite genera un build estático liviano que corre en el hosting barato que usa el negocio. El panel de administración usa autenticación simple y escribe directamente al JSON de productos para no necesitar un backend complejo.

## Resultado

El catálogo se vendió por primera vez a la florería de Hohenau. Al ver que funcionaba, se rediseñó y se vendió a una segunda florería.
