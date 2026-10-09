---
title: "Catálogo web para florerías — un producto, dos clientes"
summary: "Catálogo con fotos y precios, pedido por WhatsApp y panel de gestión de productos — vendido como producto replicable a dos florerías distintas."
category: ["web"]
status: "entregado"
featured: true
order: 1
clientNamePublic: false
clientGeneric: "Florerías con sucursales en Paraguay"
role: "Diseño + desarrollo completo"
stack: ["Vue 3", "Vite"]
highlights:
  - "Catálogo con fotos, precios y disponibilidad; checkout directo por WhatsApp"
  - "Panel de administración para carga y baja de productos sin tocar código"
  - "Mantenimiento mensual incluido en el precio"
  - "Producto replicable: desarrollado primero para una florería, después adaptado y vendido a una segunda"
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
---

## Contexto

Una florería con sucursales en Hohenau y Mariano Roque Alonso necesitaba mostrar sus productos online y recibir pedidos sin complicar la operación del día a día.

## Problema

Los clientes preguntaban precios por WhatsApp uno a uno. No había forma de que el negocio mostrara su catálogo actualizado, y actualizar los precios requería llamar al desarrollador.

## Qué construí

Un catálogo web con fotos, precios y estado de disponibilidad. El cliente puede ver los productos, armar su pedido y mandarlo directo por WhatsApp con un clic. El negocio actualiza productos desde un panel sin tocar código.

## Decisiones técnicas

El stack Vue 3 + Vite permite un build estático ligero, ideal para el hosting barato que maneja el negocio. El panel de administración usa autenticación simple y escribe directamente al JSON de productos para no necesitar un backend complejo.

## Resultado

El catálogo se vendió por primera vez a la florería de Hohenau. Al ver que funcionaba, se rediseñó y se vendió a una segunda florería — demostrando que el producto tiene demanda replicable.
