---
title: "IT para red de sucursales"
summary: "Infraestructura IT para red de sucursales: acceso remoto corporativo, permisos por departamento en NAS y despliegues de firewall."
category: ["it"]
status: "entregado"
featured: false
inGrid: false
order: 12
clientNamePublic: true
client: "Grupo Empresarial Franz"
clientGeneric: "Empresa con red de sucursales en Paraguay"
role: "Soporte técnico"
stack: ["RustDesk", "QNAP NAS", "FortiClient", "GitHub Actions"]
highlights:
  - "APK de RustDesk personalizado con servidor corporativo fijo, firmado con keystore corporativo"
  - "Desplegado en 15 sucursales mediante GitHub Actions"
  - "Permisos ACL en NAS QNAP por departamento"
  - "Despliegues de FortiClient para VPN corporativa"
flow:
  title: "Cómo se desplegó"
  steps:
    - label: "APK de RustDesk"
      detail: "Servidor corporativo fijo, firmado con keystore corporativo"
      icon: codigo
    - label: "GitHub Actions"
      detail: "Desplegado en 15 sucursales"
      icon: despliegue
    - label: "Sucursales"
      detail: "Acceso remoto corporativo"
      icon: sucursal
  note: "FortiClient para VPN corporativa y permisos ACL por departamento en NAS QNAP"
year: 2024
accent: "#ffd98e"
---

## Qué hice

Trabajé como soporte técnico en Grupo Empresarial Franz, una empresa con red de sucursales en Paraguay.

Para el acceso remoto armé un APK de RustDesk con el servidor corporativo fijo, firmado con el keystore corporativo, y lo desplegué en 15 sucursales con GitHub Actions. El diagrama muestra cómo se desplegó.

Además configuré permisos ACL por departamento en el NAS QNAP y realicé despliegues de FortiClient para la VPN corporativa.
