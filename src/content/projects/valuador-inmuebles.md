---
title: "Valuador automático de inmuebles — Gran Asunción"
summary: "Modelo de valuación automática (AVM) que estima el precio de oferta de viviendas en el Gran Asunción. Proyecto final de carrera, en equipo con Oscar Arce."
category: ["sistemas", "academico"]
status: "en-desarrollo"
featured: true
order: 2
clientNamePublic: false
clientGeneric: "Proyecto académico — Ingeniería en Informática"
role: "Proyecto final de carrera, en equipo con Oscar Arce"
stack: ["TODO:"]
highlights:
  - "Estima precio de oferta (asking price), no de transacción — distinción central: los precios publicados en avisos no son los precios cerrados"
  - "Variables geográficas construidas a partir de texto y nombre de barrio, porque los avisos inmobiliarios de Paraguay no incluyen coordenadas confiables"
  - "Arquitectura contract-first con datos sintéticos sobre un schema fijo, para que el equipo avance en paralelo antes de tener datos reales disponibles"
year: 2025
accent: "#ffd98e"
---

## Contexto

Proyecto final de carrera de Ingeniería en Informática, en equipo con Oscar Arce. El objetivo es construir un modelo de valuación automática (AVM) para el mercado inmobiliario del Gran Asunción.

## Problema

En Paraguay no existe un sistema de valuación automática accesible para viviendas. Los avisos publicados en portales muestran precios de oferta, no precios de transacción — una distinción importante que el modelo tiene que dejar clara para no confundir al usuario.

Un desafío adicional: los avisos inmobiliarios paraguayos casi nunca incluyen coordenadas GPS confiables, lo que impide usar variables geográficas directas. Las variables de ubicación se construyen a partir del texto del aviso y el nombre del barrio.

## Qué construí

El modelo estima el precio de oferta (el precio al que el vendedor publica, no necesariamente al que cierra) a partir de características de la propiedad y variables derivadas de su ubicación textual.

Para permitir que el equipo trabaje en paralelo desde el inicio, se adoptó una arquitectura contract-first: se definió un schema fijo de datos y se generaron datos sintéticos sobre ese schema. Así, el desarrollo de los módulos avanzó sin depender de tener datos reales disponibles.

## Estado

Proyecto en desarrollo activo al momento de publicar este portfolio.
