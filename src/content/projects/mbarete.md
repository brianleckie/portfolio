---
title: "Mbarete"
subtitle: "gestión integral para gimnasios"
summary: "Sistema de gestión para gimnasios: socios, cuotas, kiosco, cierre de caja y avisos por WhatsApp."
category: ["sistemas", "web"]
status: "en-produccion"
featured: true
order: 1
clientNamePublic: false
clientGeneric: "Gimnasios y boxes en Argentina y Paraguay"
role: "Creador y desarrollador full-stack"
stack: ["React", "FastAPI", "PostgreSQL", "Python"]
highlights:
  - "Módulos integrados: socios, cuotas, kiosco de productos, cierre de caja diario"
  - "Avisos automáticos por WhatsApp para cuotas vencidas y comunicados"
  - "Pensado para boxes y estudios chicos; la UI en React se usa desde el celular del encargado"
  - "Un solo lugar para lo que antes se llevaba en Excel y cuadernos"
demoUrl: "https://www.mbarete.fit"
results:
  - "Lo usan 5 gimnasios en Argentina y Paraguay."
year: 2024
accent: "#ffc3a0"
shots:
  default:
    waitFor: "#inicio h1"
    stickyBottom: "nav.bottom-nav"
    alt:
      path: "https://app.mbarete.fit/?demo=1"
      click: 'body:has([role="status"]:text-matches("Estás entrando a la demo")) button:text-is("Ingresar")'
      waitFor: ':visible:text-matches("^Vencida hace [0-9]+ días")'
      css: ".db-toast { display: none !important; }"
---

## Contexto

Los gimnasios chicos y boxes manejan socios, cobros y kiosco con hojas de Excel y cuadernos.

## Problema

Sin sistema, el dueño recuerda las cuotas vencidas, registra los pagos y cierra la caja a mano, y las ventas del kiosco quedan anotadas en el mismo cuaderno.

## Qué construí

Un SaaS con módulos integrados: gestión de socios con estados activo/inactivo/suspendido, registro de cuotas con fecha de vencimiento, kiosco de productos con stock, cierre de caja diario y avisos automáticos por WhatsApp para cuotas próximas a vencer.

El backend en FastAPI maneja múltiples gimnasios en la misma instancia con aislamiento por tenant. La UI en React está pensada para usarse desde el celular del encargado.
