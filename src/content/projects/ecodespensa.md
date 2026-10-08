---
title: "Ecodespensa — sincronización con Tiendanube"
summary: "TODO: Integración que sincroniza el sistema de gestión del local con la tienda online en Tiendanube."
category: ["integraciones", "sistemas"]
status: "en-produccion"
featured: true
order: 6
clientNamePublic: false
clientGeneric: "TODO: tienda con sistema de gestión local"
role: "TODO: desarrollador backend"
stack: ["FastAPI", "PostgreSQL", "Railway"]
highlights:
  - "Integración OAuth con la API de Tiendanube para sincronizar catálogo y stock"
  - "Interfaz ExcelSource/ApiSource que permitió avanzar ~80% del desarrollo antes de tener credenciales reales de la API"
  - "Deploy en Railway con PostgreSQL como base de datos"
year: 2024
accent: "#c8b6ff"
---

## Contexto

TODO: descripción del cliente y el negocio.

## Problema

TODO: qué problema resolvía la integración.

## Qué construí

Una integración que conecta el sistema de gestión del local (Bistrosoft) con la tienda online en Tiendanube. La sincronización mantiene en línea el catálogo y el stock entre ambas plataformas.

Para arrancar antes de tener las credenciales reales de la API de Tiendanube, se diseñó una interfaz abstracta con dos implementaciones: `ExcelSource` (leer datos desde el export de Excel del sistema) y `ApiSource` (leer directamente desde la API). Esto permitió avanzar aproximadamente el 80% del desarrollo con datos reales de Excel mientras se gestionaba el acceso a la API.

## Estado

TODO: estado actual del proyecto.
