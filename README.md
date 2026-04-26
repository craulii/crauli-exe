# CRAULI.EXE

> *"Do what thou wilt shall be the whole of the Law."*

Sitio personal de Crauli — agente del caos digital. Estética underground de los 2000, inspirada en Three 6 Mafia, Memphis horrorcore, Geocities y la energía de internet antes de que todos lo arruinaran.

---

## ¿Qué es esto?

Una página web personal con:

- **Pantalla de entrada** con advertencia tipo Geocities
- **Efectos CRT** — scanlines, ruido VHS, glitch en texto
- **Fotos flotantes** tipo DVD screensaver (clickables → LinkedIn)
- **Ruleta Rusa** — imagen que abre un link aleatorio
- **Galería TCG** — carruseles por categoría (Pokémon, One Piece, Magic)
- **Guestbook** — deja mensajes, guardados en localStorage
- **Contador de visitas** — localStorage, estilo retro
- **Música de fondo** — autoplay con control ON/OFF
- **Easter eggs** — Konami code, contador de clicks, idle timer

---

## Inicio rápido

### 1. Añadir imágenes personales

Copia tus fotos a `assets/me/` y lista los nombres en `config.js`:

```javascript
floatingPhotos: ["foto1.jpg", "foto2.jpg"],
ruletaImage: "./assets/me/ruleta.jpg",
```

### 2. Añadir cartas TCG

Copia imágenes a `assets/tcg/pokemon/`, `assets/tcg/onepiece/` o `assets/tcg/magic/` y lista los nombres en `config.js`:

```javascript
tcgImages: {
  pokemon: ["charizard.jpg", "pikachu.jpg"],
  onepiece: ["luffy.jpg"],
  magic: ["black-lotus.jpg"]
}
```

### 3. Añadir música

Copia un archivo `.mp3` a `assets/audio/background.mp3` (o actualiza la ruta en `config.js`).

### 4. Abrir el sitio

Abre `index.html` directamente en el navegador — no se necesita servidor local.

> **Nota:** Las imágenes flotantes funcionan mejor en servidor (local o Vercel) ya que algunos navegadores bloquean rutas relativas en `file://`.

---

## Estructura de archivos

```
/
├── index.html          ← Estructura HTML completa
├── style.css           ← Todos los estilos y efectos visuales
├── config.js           ← ⭐ EDITA AQUÍ — links, imágenes, música
├── main.js             ← Toda la lógica JavaScript
├── .gitignore
├── README.md           ← Este archivo
├── DOCUMENTATION.md    ← Documentación técnica profunda
├── ARCHITECTURE.md     ← Arquitectura del proyecto
├── CONFIG.md           ← Guía completa de config.js
├── ASSETS.md           ← Cómo añadir imágenes y audio
├── DEPLOY.md           ← Guía de deploy (GitHub + Vercel + dominio)
└── assets/
    ├── audio/          ← background.mp3 va aquí
    ├── me/             ← Tus fotos van aquí
    └── tcg/
        ├── pokemon/    ← Cartas Pokémon
        ├── onepiece/   ← Cartas One Piece
        └── magic/      ← Cartas Magic: The Gathering
```

---

## Personalización rápida

Toda la configuración está en **`config.js`**. Los valores más comunes:

| Variable | Qué hace |
|----------|----------|
| `linkedinURL` | URL de LinkedIn para las fotos flotantes |
| `ruletaLinks` | Array de URLs para la ruleta rusa |
| `floatingPhotos` | Filenames de tus fotos en `/assets/me/` |
| `tcgImages` | Filenames de tus cartas por categoría |
| `audioPath` | Ruta al archivo de música |
| `tagline` | Subtítulo bajo el nombre en el header |

Ver `CONFIG.md` para documentación completa de cada opción.

---

## Deploy

Ver `DEPLOY.md` para instrucciones paso a paso de:
- **GitHub** — crear repo y subir archivos
- **Vercel** — deploy automático desde GitHub
- **Dominio personalizado** — registros DNS exactos

---

## Easter eggs

- **Konami code**: `↑↑↓↓←→←→BA` — invoca la pantalla oculta
- **66 clicks**: En cualquier parte de la página
- **30 segundos de inactividad**: "NO SIGNAL" screen

Los thresholds se pueden modificar en `config.js`.

---

## Tecnología

- **Vanilla HTML/CSS/JS** — sin frameworks, sin build step
- **LocalStorage** — para contador y guestbook
- **Google Fonts** — VT323, Creepster, Share Tech Mono (CDN)
- **requestAnimationFrame** — para las fotos flotantes
- **CSS Animations** — todos los efectos CRT y glitch

---

*Built with hate, vanilla JS, cerveza, and black magic — MMXXVI*
