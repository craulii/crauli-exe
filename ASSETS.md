# ASSETS.MD — Cómo gestionar imágenes y audio

---

## Estructura de carpetas

```
assets/
├── audio/
│   └── background.mp3         ← Música de fondo
├── me/
│   ├── foto1.jpg              ← Fotos flotantes
│   ├── foto2.jpg
│   └── ruleta.jpg             ← Imagen de la ruleta rusa
└── tcg/
    ├── pokemon/
    │   ├── charizard-holo.jpg
    │   └── pikachu.jpg
    ├── onepiece/
    │   └── luffy-gear5.jpg
    └── magic/
        └── black-lotus.jpg
```

---

## Añadir fotos personales (flotantes)

Las fotos flotantes son las imágenes que rebotan por la pantalla tipo DVD screensaver.

**Pasos:**

1. Copia tu imagen a `assets/me/` (cualquier formato: `.jpg`, `.png`, `.webp`)
2. Abre `config.js` y añade el nombre del archivo al array `floatingPhotos`:

```javascript
floatingPhotos: [
  "foto1.jpg",
  "mi-nueva-foto.png",   // ← añadiste esta
],
```

3. Guarda `config.js` y recarga la página.

**Recomendaciones:**
- Tamaño ideal: 200×200 px a 400×400 px
- Formato: `.jpg` o `.webp` para menor peso
- Las fotos se muestran como cuadrados (object-fit: cover) — las caras centradas se ven mejor
- Máximo recomendado: 5-6 fotos para no saturar la pantalla

---

## Añadir imagen de ruleta rusa

1. Copia la imagen a `assets/me/ruleta.jpg` (o cualquier nombre)
2. Actualiza `config.js`:

```javascript
ruletaImage: "./assets/me/mi-imagen-ruleta.jpg",
```

**Recomendaciones:**
- Cualquier aspecto funciona (se mantiene la proporción original)
- Ancho máximo recomendado: 400px (se limita por CSS)

---

## Añadir cartas TCG

Cada categoría tiene su propia carpeta. El nombre del archivo se convierte automáticamente en el título visible de la carta.

**Ejemplo:** `black-lotus.jpg` → aparece como `"Black Lotus"`

**Reglas de conversión del nombre:**
- Se elimina la extensión (`.jpg`, `.png`, etc.)
- Guiones (`-`) y underscores (`_`) se reemplazan por espacios
- Primera letra de cada palabra en mayúscula

| Filename | Título mostrado |
|----------|----------------|
| `charizard-holo.jpg` | `Charizard Holo` |
| `black_lotus.jpg` | `Black Lotus` |
| `luffy_gear5_alt.jpg` | `Luffy Gear5 Alt` |

**Pasos para Pokémon:**

1. Copia la imagen a `assets/tcg/pokemon/charizard-holo.jpg`
2. Añade en `config.js`:

```javascript
tcgImages: {
  pokemon: ["charizard-holo.jpg"],  // ← añade aquí
  ...
}
```

**Pasos para One Piece / Magic:** Igual, usando las carpetas y arrays correspondientes.

**Formatos soportados:** `.jpg`, `.png`, `.webp`, `.gif`

**Dimensiones recomendadas:**
- Aspect ratio de carta: 2.5:3.5 (standard TCG)
- Pokémon y Magic: ~63×88 mm proporción
- One Piece: similar

---

## Añadir música

1. Copia tu archivo de música a `assets/audio/background.mp3`
2. Si usas otro nombre o formato, actualiza `config.js`:

```javascript
audioPath: "./assets/audio/mi-musica.mp3",
audioVolume: 0.3,   // 0.0 (silencio) a 1.0 (máximo)
```

**Formatos soportados:** `.mp3`, `.ogg`, `.wav`, `.aac`

**Recomendaciones:**
- `.mp3` tiene el mejor soporte cross-browser
- Volumen `0.2–0.4` es lo suficientemente presente sin molestar
- El audio hace loop automático
- Si no hay archivo de audio, el sitio funciona sin error (solo no hay música)

**Nota sobre autoplay:** Los navegadores modernos bloquean el autoplay sin interacción del usuario. La música intenta iniciarse automáticamente al hacer click en "ENTER.EXE". Si falla, el usuario puede activarla manualmente con el botón "MUSIC: OFF" en la esquina superior derecha.

---

## Optimización de imágenes

Para mejor rendimiento en producción:

- **Formato:** Preferir `.webp` sobre `.jpg` (30-40% menor tamaño)
- **Tamaño máximo recomendado:**
  - Fotos flotantes: < 100KB cada una
  - Cartas TCG: < 150KB cada una
  - Imagen ruleta: < 200KB

Herramientas gratuitas:
- [Squoosh](https://squoosh.app/) — compresión online
- [TinyPNG](https://tinypng.com/) — para PNG/JPG
