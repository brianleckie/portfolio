---
title: "Lhoney"
subtitle: "catálogo con carrito y pedido por WhatsApp"
summary: "Boutique de regalos con catálogo multi-categoría, carrito y checkout por WhatsApp. El contenido vive en un solo archivo de datos."
category: ["web"]
status: "en-produccion"
featured: true
order: 4
clientNamePublic: false
clientGeneric: "Boutique de regalos en Paraguay"
role: "Diseño + desarrollo completo"
stack: ["Vue 3", "Vite"]
highlights:
  - "Catálogo multi-categoría: belleza, hogar y mesa, regalos personalizados, termos, accesorios, canastas"
  - "Estado de stock por producto (disponible / agotado) visible al instante"
  - "Carrito y checkout directo por WhatsApp: el cliente arma su pedido y lo envía con un clic"
  - "Contenido en un solo archivo de datos, que se edita sin tocar el código de la interfaz"
links:
  - label: "Lhoney"
    url: "https://lhoney.store"
year: 2024
accent: "#b9f2df"
shots:
  default:
    waitFor: "#pedido h3"
    alt:
      scrollTo: "#pedido"
---

## Contexto

Una boutique de regalos necesitaba mostrar su catálogo online con múltiples categorías y permitir que sus clientes hicieran pedidos sin salir de WhatsApp.

## Problema

El negocio manejaba consultas de stock y pedidos manualmente por mensajes. Sin un catálogo visible, los clientes no podían ver qué había disponible antes de preguntar, y la dueña respondía las mismas preguntas repetidamente.

## Qué construí

Un catálogo web con Vue 3 y Vite, organizado en categorías y con estado de stock por producto. El cliente navega, agrega al carrito y genera un mensaje de WhatsApp con todo el detalle del pedido. Todo el contenido vive en un archivo de datos central.

## Próximo paso

Fase 2 planificada: login para que la dueña y las empleadas actualicen el stock directamente desde el navegador, sin tocar archivos.
