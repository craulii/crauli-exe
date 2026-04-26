# DOCUMENTATION.MD — Documentación técnica profunda de Crauli.exe

Este documento explica en detalle cómo funciona cada sistema del sitio, las decisiones técnicas tomadas, y advertencias de errores comunes.

---

## Sistema de efectos visuales CRT

### Scanlines
Las scanlines se implementan como un `::before` pseudo-elemento en `body` con un `repeating-linear-gradient` vertical de 4px de repetición:

```css
body::before {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.07) 2px,
    rgba(0,0,0,0.07) 4px
  );
  animation: scanlineScroll 12s linear infinite;
}
```

La animación `scanlineScroll` mueve el fondo verticalmente creando la ilusión de que las scanlines se desplazan (como un CRT real).

**Por qué `::before` en `body` y no un `<div>` separado:** Evita añadir un elemento al DOM solo para efectos decorativos. `pointer-events: none` garantiza que no bloquea interacciones.

### Ruido/Grain
El ruido usa un SVG inline con `feTurbulence`:

```css
body::after {
  background-image: url("data:image/svg+xml,...feTurbulence...");
  animation: noiseFlicker 0.15s steps(1) infinite;
}
```

`steps(1)` en la animación crea un movimiento discreto (no interpolado) que simula estática real — a diferencia de `linear` que produciría un movimiento suave poco creíble.

### Screen flicker
Todo el `body` tiene `animation: screenFlicker` que baja la opacidad brevemente en momentos irregulares:

```css
@keyframes screenFlicker {
  89%  { opacity: 1; }
  91%  { opacity: 0.4; }   /* baja drásticamente */
  92%  { opacity: 1; }     /* recupera rápido */
}
```

Los porcentajes irregulares (no 0/50/100) crean una sensación no periódica, más realista.

---

## Efecto Glitch en texto

El glitch de texto funciona con tres capas apiladas del mismo texto:

```
┌─────────────────────────────┐
│   ::after (slice bottom)    │  ← color púrpura, offset left: -2px
│   ::before (slice top)      │  ← color verde, offset left: +2px
│   elemento original         │  ← color rojo, animación RGB shift
└─────────────────────────────┘
```

Cada pseudo-elemento usa `clip-path: inset(top% 0 bottom% 0)` para mostrar solo una franja del texto, creando la apariencia de "rebanadas" desplazadas.

**Requisito crítico:** El atributo `data-text` del elemento debe ser idéntico al texto visible. Si no coinciden, las capas de glitch mostrarán texto diferente:

```html
<!-- Correcto -->
<h1 class="glitch" data-text="CRAULI.EXE">CRAULI.EXE</h1>

<!-- Incorrecto — glitch mostrará texto diferente -->
<h1 class="glitch" data-text="CRAULI">CRAULI.EXE</h1>
```

---

## Sistema de fotos flotantes (física de rebote)

Las fotos usan física simple de rebote tipo "DVD screensaver":

```javascript
// En cada frame (requestAnimationFrame):
p.x += p.vx;  // mover por velocidad
p.y += p.vy;

// Rebote en borde derecho
if (p.x + p.size >= W) {
  p.vx = -Math.abs(p.vx);  // invertir dirección
  p.rotation = -(random);  // rotar al rebotar
}
```

**Por qué `Math.abs()` en lugar de solo `p.vx *= -1`:** Evita el caso donde la imagen queda atrapada fuera del viewport. Si `p.x` ya superó el borde cuando se detecta la colisión, una simple inversión podría hacer que rebote "hacia adentro" en la dirección equivocada. `Math.abs()` garantiza que la velocidad siempre apunte hacia el interior.

**Por qué `requestAnimationFrame` en lugar de `setInterval`:** 
- rAF se sincroniza con el refresh rate del monitor (60/120/144fps)
- Se pausa automáticamente cuando la pestaña está en background (ahorra CPU)
- No acumula "ticks perdidos" como setInterval

---

## Audio y política de Autoplay

Los navegadores modernos bloquean el autoplay de audio sin interacción del usuario (política implementada desde Chrome 66, 2018).

**Estrategia de Crauli.exe:**

1. El `<audio>` se crea con `new Audio()` (no en el HTML) para evitar errores antes de que el usuario interactúe
2. `tryAutoplay()` se llama DESPUÉS del click en "ENTER.EXE" (que cuenta como user gesture)
3. Si aún falla (algunos navegadores son más estrictos), se captura el error silenciosamente
4. El botón "MUSIC: OFF" permite activación manual

```javascript
audio.play()
  .then(() => _updateUI(true))   // éxito: actualizar UI
  .catch(() => _updateUI(false)); // fallo silencioso: user activa manualmente
```

**Error común:** "La música no suena aunque tengo el archivo". Causa más probable: el navegador bloqueó el autoplay. Solución: hacer click en el botón "MUSIC: OFF".

---

## Guestbook y seguridad XSS

El guestbook es el único punto donde se recibe input del usuario. Se implementaron dos capas de protección:

**Capa 1 — Sanitización:** La función `_sanitize()` escapa caracteres HTML:
```javascript
str.replace(/</g, '&lt;').replace(/>/g, '&gt;')...
```

**Capa 2 — textContent (más importante):** Los mensajes se insertan en el DOM usando `element.textContent`, nunca `innerHTML`:
```javascript
bodyEl.textContent = msg.text;  // textContent — XSS safe
// NO: bodyEl.innerHTML = msg.text  // ← esto sería vulnerable
```

`textContent` trata el string como texto plano, no como HTML. Cualquier `<script>` o `<img onerror>` queda como texto literal, sin ejecutarse.

**Límites de longitud** validados en cliente:
- Nombre: máximo 50 caracteres
- Mensaje: máximo 500 caracteres
- Máximo 100 mensajes guardados (los más antiguos se eliminan)

---

## localStorage — Estructura y límites

| Key | Formato | Máx aprox |
|-----|---------|-----------|
| `crauli_visits` | String numérico (`"42"`) | N/A |
| `crauli_guestbook` | JSON array (100 msgs) | ~60KB |

**Límite total de localStorage:** ~5MB por dominio (varía por browser). Los 100 mensajes máximos y los ~600 chars max por mensaje garantizan que `crauli_guestbook` nunca supere ~60KB.

**Los datos son locales al navegador del visitante.** Esto significa:
- Cada visitante ve solo sus propios mensajes
- Un visitante en Chrome no ve los mensajes de otro en Firefox
- Limpiar caché del navegador borra los datos

Si necesitas un guestbook compartido entre visitantes, necesitarás un backend (Supabase, Firebase, etc.) — eso requeriría modificar la arquitectura actual.

---

## Easter Eggs — Detalles técnicos

### Konami Code
Se mantiene un índice de posición en la secuencia `KONAMI[]`. En cada `keydown`:
- Si la tecla coincide con `KONAMI[konamiIndex]`, avanzar índice
- Si no coincide pero coincide con `KONAMI[0]`, resetear a 1 (empezar de nuevo)
- Si no coincide con nada, resetear a 0

Esto permite que la secuencia se "busque" aunque haya otras teclas entre medio — comportamiento estándar del Konami code.

### Click counter
Se usa un contador simple `clickCount++` en un listener global de `click`. Se excluyen clicks en los botones de cerrar easter eggs para no contar los dismissals.

### Idle timer
```javascript
// En cada evento de actividad del usuario:
clearTimeout(idleTimer);  // cancelar timer anterior
idleTimer = setTimeout(_triggerNoSignal, timeout * 1000);  // reiniciar
```

Se escuchan: `mousemove`, `mousedown`, `keydown`, `scroll`, `touchstart`.

---

## Drag-to-scroll en TCG

El carrusel TCG permite arrastrar con el mouse para desplazar horizontalmente:

```javascript
el.addEventListener('mousedown', (e) => {
  startX = e.pageX - el.offsetLeft;
  scrollLeft = el.scrollLeft;
});

el.addEventListener('mousemove', (e) => {
  const x = e.pageX - el.offsetLeft;
  const walk = (x - startX) * 1.5;
  el.scrollLeft = scrollLeft - walk;
});
```

El multiplicador `1.5` aumenta la velocidad de scroll para que se sienta responsivo. Ajustar entre `1.0` (1:1) y `3.0` (muy rápido).

---

## Rendimiento

**Puntos críticos:**

1. **FloatingPhotos rAF loop:** Si hay muchas fotos (>10), el loop se vuelve costoso. Recomendado: máximo 5-6 fotos.

2. **CSS animations:** Las animaciones `screenFlicker`, `noiseFlicker` y `scanlineScroll` corren continuamente en `body::before/after`. Son `position:fixed` en una capa separada, lo que permite al browser optimizarlas en compositor thread (no bloquean el main thread).

3. **TCG Gallery lazy loading:** Todas las imágenes de cartas usan `loading="lazy"`. Las imágenes off-screen no se cargan hasta que el usuario hace scroll hasta ellas.

4. **Google Fonts:** Se usa `display=swap` en el parámetro de la URL de Google Fonts para evitar FOIT (Flash of Invisible Text). Las fuentes del sistema (`Courier New`, `Impact`) se usan como fallback hasta que cargan las fuentes custom.

---

## Errores comunes y soluciones

### Las imágenes no cargan en `file://`
**Causa:** Algunos browsers bloquean rutas relativas en protocolo `file://`.  
**Solución:** Servir localmente con `python -m http.server 8080` o usar Live Server (VS Code extension).

### La música no suena
**Causa 1:** El archivo no existe en la ruta configurada.  
**Causa 2:** Navegador bloqueó autoplay.  
**Solución:** Verificar que `assets/audio/background.mp3` existe. Si existe, usar el botón "MUSIC: OFF".

### El glitch de texto se ve mal / duplicado
**Causa:** El atributo `data-text` no coincide con el texto del elemento.  
**Solución:** Verificar que `data-text="TEXTO"` sea exactamente igual al contenido de texto del elemento.

### Las cartas TCG no aparecen
**Causa:** El filename en `config.js` no coincide exactamente con el nombre del archivo en `assets/tcg/*/`.  
**Solución:** Los nombres son case-sensitive en Linux/macOS. `Charizard.jpg` ≠ `charizard.jpg`.

### El guestbook pierde mensajes
**Causa:** El usuario borró datos del navegador / modo privado.  
**Causa 2:** Se accedió desde un navegador diferente.  
**Solución:** Es el comportamiento esperado con localStorage. No hay forma de persistir datos entre browsers sin backend.

### Las fotos flotantes no aparecen
**Causa:** `CONFIG.floatingPhotos` está vacío o los archivos no existen.  
**Solución:** Verificar que los filenames en `config.js` corresponden a archivos reales en `assets/me/`. Las imágenes con error muestran un cuadro rojo vacío que también rebota.

---

## Modificar el sitio para un nuevo dueño

Si un nuevo desarrollador (o agente de IA) toma este proyecto:

1. **Leer `config.js` primero** — contiene todos los datos editables
2. **Leer `CONFIG.md`** — documentación de cada variable
3. **Leer `ASSETS.md`** — cómo agregar imágenes y música
4. **No modificar `main.js` ni `style.css`** a menos que sea necesario cambiar comportamiento/estética
5. **Para deploy:** ver `DEPLOY.md`

El código está diseñado para que `config.js` sea el único archivo que necesita edición para personalización completa del sitio.
