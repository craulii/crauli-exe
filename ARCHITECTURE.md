# ARCHITECTURE.MD — Arquitectura de Crauli.exe

Documento técnico para desarrolladores y agentes de IA que necesitan entender o modificar el proyecto sin contexto previo.

---

## Visión general

Crauli.exe es un sitio **estático de una sola página (SPA lite)** construido en Vanilla HTML/CSS/JS. No tiene build step, no tiene framework, no tiene bundler. Los archivos se sirven directamente — funcionan en `file://` y en cualquier CDN/hosting estático.

---

## Mapa de archivos y responsabilidades

```
index.html   ← Estructura DOM. No tiene lógica ni estilos inline.
style.css    ← Todo lo visual: layout, animaciones, efectos CRT/glitch.
config.js    ← Datos editables por el usuario. Define el objeto CONFIG.
main.js      ← Toda la lógica JS. Lee CONFIG, manipula el DOM definido en index.html.
```

**Regla de oro:** Cada archivo tiene una única responsabilidad. Nunca mezclar.

---

## Orden de carga

```html
<!-- En index.html, al final de <body> -->
<link rel="stylesheet" href="style.css">   <!-- en <head> -->
<script src="config.js"></script>           <!-- primero: define CONFIG -->
<script src="main.js"></script>             <!-- segundo: usa CONFIG -->
```

`config.js` debe cargarse ANTES que `main.js` porque `main.js` referencia `CONFIG` globalmente. Si se invierte el orden, `CONFIG` será `undefined` y todo falla.

---

## Flujo de datos

```
config.js
  └── define CONFIG (objeto global congelado)
        │
        ▼
main.js (DOMContentLoaded)
  ├── EntryScreen.init()
  │     └── lee CONFIG.warningText → rellena #entry-warning-text
  │     └── en click "ENTER.EXE":
  │           ├── oculta #entry-screen
  │           ├── revela #main-site
  │           └── inicializa todos los demás módulos:
  │
  ├── VisitCounter.init()
  │     └── lee localStorage["crauli_visits"] → render en #counter-value
  │     └── increment() → escribe en localStorage + re-render
  │
  ├── AudioControl.init()
  │     └── crea <audio> con CONFIG.audioPath, CONFIG.audioVolume
  │     └── toggle button → play/pause
  │
  ├── FloatingPhotos.init()
  │     └── itera CONFIG.floatingPhotos
  │     └── crea <img> en #floating-layer para cada filename
  │     └── rAF loop → actualiza posición CSS (left/top)
  │     └── click en imagen → abre CONFIG.linkedinURL
  │
  ├── RuletaRusa.init()
  │     └── establece src de #ruleta-img = CONFIG.ruletaImage
  │     └── click → random de CONFIG.ruletaLinks → window.open()
  │
  ├── TCGGallery.init()
  │     └── itera CONFIG.tcgImages (objeto { categoria: [filenames] })
  │     └── por cada categoría: crea .tcg-category con .tcg-scroll
  │     └── por cada filename: crea <figure>.tcg-card con <img> + <figcaption>
  │     └── inyecta todo en #tcg-gallery-container
  │
  ├── Guestbook.init()
  │     └── lee localStorage["crauli_guestbook"] (JSON array)
  │     └── renderMessages() → crea <article> por cada mensaje en #guestbook-messages
  │     └── form submit → _addMessage() → re-render
  │
  ├── HeaderClock.init()
  │     └── setInterval 1s → actualiza #header-time
  │     └── rellena #site-tagline con CONFIG.tagline
  │
  ├── GlitchEffects.init()
  │     └── setTimeout aleatorio (5-15s) → añade clase .is-glitching a elemento random
  │
  └── EasterEggs.init()
        ├── keydown listener → detecta secuencia Konami
        ├── click counter → trigger en click #66
        └── idle timer (CONFIG.idleTimeoutSeconds) → "NO SIGNAL" screen
```

---

## Estructura DOM en profundidad

### Estado inicial (antes de ENTER)
```
body
  #entry-screen          ← visible, z-index: 500
  #main-site             ← display:none, aria-hidden
```

### Estado tras ENTER
```
body
  #entry-screen          ← display:none
  #main-site             ← display:block
    #audio-control       ← fixed, top-right
    #visit-counter       ← fixed, bottom-left
    #floating-layer      ← fixed, full viewport (fotos bounce aquí)
    header#site-header
      .header-statusbar
      h1.site-title.glitch
      p#site-tagline
      nav.site-nav
    main#main-content
      section#about
      section#ruleta
      section#tcg-gallery
        #tcg-gallery-container     ← vacío hasta TCGGallery.init()
      section#guestbook
        #guestbook-form
        #guestbook-messages        ← vacío hasta Guestbook.init()
    footer#site-footer
  [easter egg overlays]  ← fixed, z-index: 600, hidden por defecto
```

### Z-index layer stack (de abajo a arriba)
```
z-index:
  0        ← contenido normal
  100      ← #floating-layer (fotos)
  200      ← #audio-control, #visit-counter
  500      ← #entry-screen
  600      ← easter egg overlays
  900      ← CRT scanlines (body::before) — SIEMPRE ENCIMA
```

---

## Módulos JavaScript

Cada módulo en `main.js` es un IIFE (Immediately Invoked Function Expression) que retorna un objeto público con sus métodos. Esto crea un scope cerrado evitando contaminación del namespace global.

```javascript
const MiModulo = (() => {
  // Variables privadas (no accesibles desde fuera)
  let privada = 0;

  // Funciones privadas
  function _helper() { ... }

  // Función pública
  function init() { ... }

  // API pública del módulo
  return { init };
})();
```

### Módulos y sus responsabilidades

| Módulo | Archivo | Responsabilidad única |
|--------|---------|----------------------|
| EntryScreen | main.js | Mostrar/ocultar la pantalla de entrada |
| VisitCounter | main.js | Leer/escribir/renderizar el contador |
| AudioControl | main.js | Crear el elemento `<audio>` y gestionar el toggle |
| FloatingPhotos | main.js | Física de rebote (rAF loop) de las fotos |
| RuletaRusa | main.js | Imagen de ruleta y link aleatorio |
| TCGGallery | main.js | Construir el DOM del carrusel TCG |
| Guestbook | main.js | CRUD de mensajes en localStorage |
| HeaderClock | main.js | Reloj en tiempo real en el header |
| GlitchEffects | main.js | Glitches aleatorios en elementos del DOM |
| EasterEggs | main.js | Los tres easter eggs (Konami, clicks, idle) |

---

## CSS Architecture

`style.css` está organizado en 22 secciones numeradas (comentarios `/* === */`).

### Sistema de variables CSS
Todos los colores, tipografías y z-indices están definidos como variables CSS en `:root`. Para cambiar la paleta completa, solo editar `:root`.

### Efectos CRT (layers 3 y 4)
```
body::before  ← scanlines horizontales (repeating-linear-gradient)
body::after   ← ruido/grain (SVG feTurbulence inline)
```
Ambos son `position:fixed`, `pointer-events:none`, `z-index:900` — siempre encima de todo el contenido pero sin bloquear interacción.

### Efecto Glitch en texto
La clase `.glitch` usa `::before` y `::after` pseudo-elementos que:
1. Duplican el contenido del elemento vía `content: attr(data-text)`
2. Se posicionan absolute sobre el elemento original
3. Tienen animaciones `clip-path` que "cortan" fragmentos del texto
4. Se colorean con un canal diferente (verde/púrpura) para simular RGB split

**Requisito:** El elemento con `.glitch` DEBE tener `data-text="texto idéntico al contenido"`.

### Fuentes
Cargadas desde Google Fonts CDN en `<head>` de `index.html`:
- `VT323` — pixel art, para títulos y UI retro
- `Creepster` — horror/display, para el título principal
- `Share Tech Mono` — monospace legible, para cuerpo de texto

---

## localStorage Keys

| Key | Tipo | Descripción |
|-----|------|-------------|
| `crauli_visits` | string (número) | Contador de visitas |
| `crauli_guestbook` | JSON array | Mensajes del guestbook |

Estructura de cada mensaje en `crauli_guestbook`:
```json
{
  "name": "Nombre del usuario",
  "text": "Contenido del mensaje",
  "timestamp": "2026-04-25T14:30:00.000Z"
}
```

---

## Consideraciones de seguridad

### XSS Prevention
Los mensajes del guestbook se renderizan usando `element.textContent` (nunca `innerHTML`). La función `_sanitize()` en el módulo Guestbook también escapa caracteres HTML como defensa adicional.

### Open Redirect / Links externos
Todos los `window.open()` usan `'noopener,noreferrer'` para prevenir que las páginas destino accedan al contexto de Crauli.exe via `window.opener`.

### No hay backend
El sitio es 100% estático. No hay API, no hay base de datos, no hay servidor. Toda la persistencia es en `localStorage` del navegador del visitante (local a ese navegador — no es compartida entre visitantes).

---

## Cómo añadir una nueva sección

1. En `index.html`: añadir `<section id="nueva-seccion" class="section">` dentro de `<main>`
2. En `style.css`: añadir estilos específicos de la sección (opcionalmente)
3. En `main.js`: crear un nuevo módulo IIFE e inicializarlo en `EntryScreen.enter()`
4. En el `<nav>` de `index.html`: añadir un link `<a href="#nueva-seccion">`

---

## Cómo añadir una nueva categoría TCG

1. Crear carpeta `assets/tcg/nueva-categoria/`
2. En `config.js`: añadir al objeto `tcgImages`:
   ```javascript
   tcgImages: {
     pokemon: [...],
     onepiece: [...],
     magic: [...],
     nuevaCategoria: ["carta1.jpg"]  // ← añadir aquí
   }
   ```
3. En `main.js`, en `TCGGallery`, añadir al objeto `CATEGORY_META`:
   ```javascript
   nuevaCategoria: { label: 'NUEVA CATEGORÍA', icon: '🎴' },
   ```

---

## Dependencias externas

| Dependencia | Tipo | URL | Por qué |
|------------|------|-----|---------|
| Google Fonts | CDN | fonts.googleapis.com | VT323, Creepster, Share Tech Mono |

**Sin otras dependencias.** Sin npm, sin bundler, sin framework. Esto es intencional — el sitio debe funcionar abriendo `index.html` directamente.
