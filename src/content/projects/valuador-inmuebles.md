---
title: "AVM Gran Asunción"
summary: "Valuador automático de inmuebles: precio de oferta estimado con intervalo de predicción."
category: ["sistemas", "academico"]
status: "en-desarrollo"
featured: true
order: 2
clientNamePublic: false
clientGeneric: "Proyecto académico — Ingeniería en Informática"
role: "Proyecto final de Ingeniería Informática, junto a Oscar Arce"
stack: ["Python", "FastAPI", "LightGBM", "React"]
highlights:
  - "Calculadora web: dada la ubicación y características de una casa, departamento o dúplex en Asunción, Luque, San Lorenzo o Fernando de la Mora, estima precio por m² y valor total con un rango de error."
  - "Dataset propio y reproducible de avisos de portales inmobiliarios locales, recolectados con web scraping ético, limpiados y deduplicados."
  - "Variables geográficas a nivel barrio (distancia a avenidas, shoppings, colegios) y modelos de regresión: baseline por barrio, LightGBM y Random Forest."
  - "Intervalos de predicción con cobertura verificable, no un «±» arbitrario."
year: 2025
accent: "#ffd98e"
---

## Contexto

En Paraguay no existe un registro público de precios de cierre ni un MLS, y tasar un inmueble es un ejercicio subjetivo. Lo único masivo y accesible son los precios publicados en portales inmobiliarios.

## Problema

La pregunta central de investigación: ¿las variables geográficas mejoran la predicción del precio? Se mide con una ablation, comparando el modelo con y sin variables geo.

> **Limitación explícita:** el sistema estima el **precio publicado (precio de oferta)**, no el precio de transacción. Lo que un vendedor pide en un aviso no es necesariamente lo que se cierra.

## Qué construí

Una calculadora web: dada la ubicación y las características de una casa, departamento o dúplex en Asunción, Luque, San Lorenzo o Fernando de la Mora, estima el precio por m² y el valor total, con un rango de error.

Detrás hay un dataset propio y reproducible de avisos de portales inmobiliarios locales, recolectados con web scraping ético, limpiados y deduplicados.

## Decisiones técnicas

- **Variables geográficas a nivel barrio** (distancia a avenidas, shoppings, colegios).
- **Modelos de regresión:** un baseline por barrio, LightGBM y Random Forest.
- **Intervalos de predicción con cobertura verificable**, no un «±» arbitrario.
- **Ablation con y sin variables geográficas** para responder la pregunta central de la investigación.

## Estado

En desarrollo, en camino a la defensa.
