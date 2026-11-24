---
title: "KEVJER."
subtitle: "catálogo de archivo y second hand"
summary: "Dealer de piezas de archivo y second hand. Catálogo con carrito, modal de detalle por prenda y checkout por WhatsApp."
category: ["web"]
status: "entregado"
featured: false
order: 8
clientNamePublic: false
clientGeneric: "Marca de ropa de archivo, Paraguay"
role: "Diseño + desarrollo completo"
stack: ["Next.js", "Supabase", "TypeScript", "Tailwind"]
highlights:
  - "Catálogo con carrito multi-producto y modal de detalle por prenda"
  - "Checkout directo por WhatsApp"
  - "Panel admin con autenticación para gestión de inventario"
demoUrl: "https://kevjer.vercel.app/"
year: 2024
accent: "#d8624c"
shots:
  default:
    waitFor: 'a[href="#archivo"]'
    delay: 4500
    css: |
      @media (min-width: 768px) {
        main > section:has(.hero-scroll-link) img { width: min(46vh, 780px) !important; }
      }
    alt:
      scrollTo: "#archivo"
---

## Contexto

Kevjer es un dealer de piezas de archivo, originales y second hand en Paraguay. La marca necesitaba una presencia digital con estética editorial y oscura, coherente con el universo del archivo y el second hand.

## Qué construí

Un catálogo con carrito multi-producto, modal de detalle por prenda con galería de fotos, y checkout que genera un pedido formateado en WhatsApp. El panel de administración permite al dueño gestionar prendas, precios y disponibilidad con autenticación.
