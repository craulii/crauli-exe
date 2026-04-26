# CONFIG.MD — Guía completa de config.js

Todas las opciones editables de `config.js` documentadas.

---

## `linkedinURL`
**Tipo:** `string`  
**Descripción:** URL del perfil de LinkedIn (o cualquier URL). Al hacer click en cualquiera de las fotos flotantes, se abre esta URL en nueva pestaña.

```javascript
linkedinURL: "https://www.linkedin.com/in/tu-perfil",
```

---

## `ruletaLinks`
**Tipo:** `string[]`  
**Descripción:** Array de URLs para la sección "Ruleta Rusa". Cada click elige una al azar. Puedes poner cualquier cantidad — entre más, más caótico.

```javascript
ruletaLinks: [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://archive.org/",
  "https://en.wikipedia.org/wiki/Thelema",
],
```

---

## `ruletaImage`
**Tipo:** `string`  
**Descripción:** Ruta a la imagen que aparece en la sección Ruleta Rusa. La ruta es relativa a `index.html`.

```javascript
ruletaImage: "./assets/me/ruleta.jpg",
```

Si el archivo no existe, se muestra un placeholder con instrucciones.

---

## `audioPath`
**Tipo:** `string`  
**Descripción:** Ruta al archivo de audio para la música de fondo. Formato recomendado: `.mp3`. También acepta `.ogg` y `.wav`.

```javascript
audioPath: "./assets/audio/background.mp3",
```

---

## `audioVolume`
**Tipo:** `number` (0.0 – 1.0)  
**Descripción:** Volumen inicial de la música. 0.0 = silencio, 1.0 = máximo.  
**Recomendado:** Entre `0.2` y `0.4` para no asustar a los visitantes.

```javascript
audioVolume: 0.3,
```

---

## `floatingPhotos`
**Tipo:** `string[]`  
**Descripción:** Array de **nombres de archivo** (no rutas completas) de las fotos que flotarán. Los archivos deben estar en `assets/me/`.

```javascript
floatingPhotos: ["foto1.jpg", "foto2.jpg", "selfie.webp"],
```

**Para añadir una foto:**
1. Copia el archivo a `assets/me/foto.jpg`
2. Añade `"foto.jpg"` al array

---

## `tcgImages`
**Tipo:** `{ pokemon: string[], onepiece: string[], magic: string[] }`  
**Descripción:** Imágenes de cartas por categoría. Los archivos deben estar en sus respectivas carpetas dentro de `assets/tcg/`.

```javascript
tcgImages: {
  pokemon: ["charizard-holo.jpg", "pikachu.jpg"],
  onepiece: ["luffy-gear5.jpg"],
  magic: ["black-lotus.jpg", "ancestral-recall.jpg"]
},
```

**Para añadir una carta:**
1. Copia la imagen a `assets/tcg/pokemon/carta.jpg`
2. Añade `"carta.jpg"` al array correspondiente

El nombre del archivo (sin extensión, con dashes/underscores reemplazados por espacios) se muestra como título de la carta. Ejemplo: `"black-lotus.jpg"` → muestra `"Black Lotus"`.

---

## `warningText`
**Tipo:** `string`  
**Descripción:** Texto mostrado en la pantalla de entrada. Usa `\n` para saltos de línea. Hazlo amenazante.

```javascript
warningText: "⚠ ADVERTENCIA ⚠\nContenido perturbador.\nProcede bajo tu propio riesgo.",
```

---

## `tagline`
**Tipo:** `string`  
**Descripción:** Subtítulo que aparece bajo "CRAULI.EXE" en el header del sitio.

```javascript
tagline: "[ AGENTE DEL CAOS DIGITAL · THELEMA · CERVEZA · TCG ]",
```

---

## `demonClickThreshold`
**Tipo:** `number`  
**Descripción:** Número de clicks en cualquier parte de la página antes de que aparezca el easter egg del demonio. Usa `0` para desactivar.

```javascript
demonClickThreshold: 66,
```

---

## `idleTimeoutSeconds`
**Tipo:** `number`  
**Descripción:** Segundos de inactividad antes de mostrar la pantalla "NO SIGNAL". Usa `0` para desactivar.

```javascript
idleTimeoutSeconds: 30,
```

---

## Ejemplo de config.js completo personalizado

```javascript
const CONFIG = {
  linkedinURL: "https://www.linkedin.com/in/mi-perfil",
  ruletaLinks: [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://archive.org/",
  ],
  ruletaImage: "./assets/me/mi-foto-ruleta.jpg",
  audioPath: "./assets/audio/three-six-mafia.mp3",
  audioVolume: 0.25,
  floatingPhotos: ["cara.jpg", "mano.jpg"],
  tcgImages: {
    pokemon: ["charizard.jpg"],
    onepiece: ["luffy.jpg"],
    magic: ["black-lotus.jpg"]
  },
  warningText: "PELIGRO\nEsta página puede dañar tu mente.",
  tagline: "[ CAOS DIGITAL PURO ]",
  demonClickThreshold: 66,
  idleTimeoutSeconds: 30,
};
Object.freeze(CONFIG);
```
