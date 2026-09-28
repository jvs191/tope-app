# Tope App — Control de presupuesto de compras

Prototipo funcional de una app de control de presupuesto en tiempo real: el
cliente define cuánto quiere gastar, escanea (o simula) cada producto, y la
app rechaza automáticamente cualquier agregado que supere el presupuesto.

**100% HTML/CSS/JavaScript nativo — sin frameworks, sin build, sin
dependencias de terceros.** Se abre directamente en el navegador.

**Demo en vivo:** https://jvs191.github.io/tope-app/

## Características

- Motor de presupuesto único: escaneo por cámara, productos de muestra,
  carga manual y el botón "+" del carrito pasan todos por la misma regla
  (`rechazar si total + costo > presupuesto`).
- Escaneo de códigos de barras con la cámara (API `BarcodeDetector`, cuando
  el navegador la soporta) con fallback táctil (productos de muestra) y por
  código manual.
- Bilingüe (Português do Brasil / Español de Uruguay) y multi-moneda
  (BRL / UYU / USD), con umbral de alerta configurable.
- Bloque comercial "Aprovecha tu compra": tarjeta compacta y descartable con
  beneficios rotativos (promociones, fidelización, cupones, etc.), con
  prioridad y vigencia configurables, visible solo en las pantallas de
  Compra, Resultado y Resumen. Se puede desactivar por completo en Ajustes.
- Sonido y vibración de confirmación, deshacer, y persistencia de
  preferencias vía `localStorage`.
- Interfaz responsiva: se adapta a teléfonos chicos, estándar, grandes y
  tablets (vertical/horizontal).

## Estructura

```
index.html   markup de las 10 pantallas
style.css    variables de diseño y estilos
app.js       estado, motor de presupuesto, render y eventos
assets/      sonidos de confirmación (mp3)
```

Catálogo de productos y contenido del bloque de beneficios viven como datos
en `app.js` (arrays `CATALOG` y `BENEFICIOS`) — reemplazables por una fuente
real (API/base de datos) sin tocar el resto del código.

## Cómo probarlo

Ábrelo con cualquier servidor estático (o directamente el archivo en el
navegador). Para usar la cámara necesitas HTTPS (o `localhost`) — por
`file://` el navegador bloquea el acceso a la cámara.

Truco: doble clic sobre el logo de la pantalla de bienvenida carga un
ejemplo (presupuesto y carrito precargados) para probar el flujo de rechazo
rápido.

## Limitaciones conocidas

- **iOS Safari no soporta `BarcodeDetector`**: ahí la lectura por cámara no
  funciona; queda disponible la simulación táctil o el código manual.
- El catálogo de productos y el contenido del bloque de beneficios
  comerciales son datos de demostración.
