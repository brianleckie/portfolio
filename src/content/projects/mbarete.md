---
title: "Mbarete — gestión integral para gimnasios"
summary: "Sistema todo-en-uno para gimnasios chicos: socios, cuotas, kiosco, cierre de caja y avisos por WhatsApp en una sola app."
category: ["sistemas", "web"]
status: "en-produccion"
featured: true
order: 5
clientNamePublic: false
clientGeneric: "Gimnasios y boxes en Paraguay"
role: "Fundador y Lead Developer"
stack: ["React", "FastAPI", "PostgreSQL", "Python"]
highlights:
  - "Módulos integrados: socios, cuotas, kiosco de productos, cierre de caja diario"
  - "Avisos automáticos por WhatsApp para cuotas vencidas y comunicados"
  - "Pensado para boxes y estudios que no quieren contratar un administrativo extra"
  - "Reemplaza el Excel y el ERP caro en un solo lugar"
demoUrl: "https://www.mbarete.fit"
results:
  - "3 gimnasios operando en producción"
year: 2024
accent: "#ffc3a0"
---

## Contexto

Los gimnasios chicos y boxes de Paraguay manejan socios, cobros y kiosco con hojas de Excel y cuadernos. Los ERPs disponibles son caros y complejos para un negocio de 50–200 socios.

## Problema

Sin sistema, el dueño pierde tiempo en tareas administrativas que se podrían automatizar: recordar cuotas vencidas, registrar pagos, cerrar caja. Y sin un kiosco integrado, las ventas del día se pierden en el mismo cuaderno.

## Qué construí

Un SaaS con módulos integrados: gestión de socios con estados activo/inactivo/suspendido, registro de cuotas con fecha de vencimiento, kiosco de productos con stock, cierre de caja diario y avisos automáticos por WhatsApp para cuotas próximas a vencer.

El backend en FastAPI maneja múltiples gimnasios en la misma instancia con aislamiento por tenant. La UI en React está pensada para usarse desde el celular del encargado.

## Resultado

Tres gimnasios en producción al momento de publicar este portfolio.
