# DEPLOY.MD — Guía de deploy completa

## Paso 1: GitHub

### Crear el repositorio

**Opción A — GitHub CLI (recomendado):**
```bash
# Instalar gh si no lo tienes: https://cli.github.com/
gh auth login
gh repo create crauli-exe --public --source=. --push
```

**Opción B — Manual:**
1. Ir a https://github.com/new
2. Nombre del repo: `crauli-exe`
3. Visibilidad: Public (necesario para Vercel free tier)
4. NO añadir README ni .gitignore (ya los tenemos)
5. Click "Create repository"

### Subir los archivos

```bash
# En la carpeta del proyecto:
git init
git add index.html style.css config.js main.js
git add README.md DOCUMENTATION.md ARCHITECTURE.md CONFIG.md ASSETS.md DEPLOY.md
git add .gitignore
git add assets/          # incluye las subcarpetas vacías con .gitkeep
git commit -m "Initial commit: Crauli.exe cursed site"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/crauli-exe.git
git push -u origin main
```

> **Reemplaza `TU_USUARIO`** con tu nombre de usuario de GitHub.

### Verificar el push
Ir a `https://github.com/TU_USUARIO/crauli-exe` — deberías ver todos los archivos.

---

## Paso 2: Vercel

### Opción A — Desde la dashboard de Vercel (más fácil)

1. Ir a https://vercel.com y crear cuenta (gratis con GitHub)
2. Click **"Add New Project"**
3. Seleccionar el repositorio `crauli-exe`
4. Configuración:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (dejar por defecto)
   - **Build Command:** dejar vacío (no hay build step)
   - **Output Directory:** dejar vacío (sirve la raíz)
5. Click **"Deploy"**
6. Esperar ~30 segundos → Vercel te da una URL: `crauli-exe-xxx.vercel.app`

### Opción B — CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta del proyecto:
vercel

# Seguir el wizard:
# ? Set up and deploy? Y
# ? Which scope? (tu cuenta)
# ? Link to existing project? N
# ? Project name: crauli-exe
# ? Directory: ./
# No build command, no output directory
```

### Deploy automático desde GitHub

Una vez conectado el repo a Vercel, cada `git push` a `main` dispara un deploy automático. No necesitas hacer nada adicional.

---

## Paso 3: Dominio personalizado

### Comprar el dominio

Puedes comprarlo en cualquier registrador:
- [Namecheap](https://www.namecheap.com) — económico, buen panel DNS
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) — precio de costo
- [Google Domains](https://domains.google) → ahora Squarespace Domains
- Cualquier registrador chileno si prefieres `.cl`

### Conectar el dominio en Vercel

1. En Vercel dashboard → tu proyecto `crauli-exe`
2. **Settings** → **Domains**
3. Click **"Add"**
4. Escribir tu dominio (ej: `craulitieneunchingodeferia.com`)
5. Click **"Add"**
6. Vercel muestra los DNS records que debes configurar

### Configurar los DNS records

En el panel DNS de tu registrador, añadir estos records:

#### Para dominio apex (sin www): `craulitieneunchingodeferia.com`

```
Tipo: A
Nombre: @  (o dejar vacío)
Valor: 76.76.21.21
TTL: 3600 (o Auto)
```

#### Para subdominio www: `www.craulitieneunchingodeferia.com`

```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600 (o Auto)
```

> **Nota:** Si tu registrador no soporta CNAME en apex (root), usa el registro A con IP `76.76.21.21` para ambos.

### Verificar la propagación DNS

La propagación DNS puede tardar de 5 minutos a 48 horas. Para verificar:

```bash
nslookup craulitieneunchingodeferia.com
# O en el navegador:
# https://dnschecker.org/
```

Cuando los DNS propagen, Vercel emite automáticamente un certificado SSL (HTTPS) gratuito via Let's Encrypt.

---

## Estructura final esperada en producción

```
https://craulitieneunchingodeferia.com/
├── index.html
├── style.css
├── config.js
├── main.js
└── assets/
    ├── audio/background.mp3
    ├── me/*.jpg
    └── tcg/
        ├── pokemon/*.jpg
        ├── onepiece/*.jpg
        └── magic/*.jpg
```

---

## Actualizar el sitio después del deploy

Para cualquier cambio:

```bash
# Editar archivos (config.js, agregar imágenes, etc.)
git add .
git commit -m "Update: descripción del cambio"
git push origin main
# Vercel detecta el push y redeploya automáticamente (~30s)
```

---

## Verificación post-deploy

- [ ] Abrir `https://tu-dominio.com` → aparece pantalla de entrada
- [ ] Click "ENTER.EXE" → aparece el sitio
- [ ] Contador de visitas se incrementa
- [ ] Música (si hay archivo MP3) intenta reproducirse
- [ ] Fotos flotantes aparecen y rebotan
- [ ] Ruleta rusa muestra imagen y redirige al hacer click
- [ ] Galería TCG muestra cartas por categoría
- [ ] Formulario de guestbook acepta y guarda mensajes
- [ ] Konami code (`↑↑↓↓←→←→BA`) activa el easter egg

---

## Problemas conocidos en producción

### Las imágenes no cargan en Vercel
**Causa más común:** El nombre en `config.js` no coincide exactamente con el archivo (case-sensitive en Linux).  
**Verificar:** En Vercel → tu proyecto → Deployments → Functions → ver logs de error 404.

### La música no suena en producción
El comportamiento de autoplay es el mismo que en local. El usuario necesita hacer click en el botón de música. Esto es una limitación del browser, no del código.

### HTTPS mixed content warnings
Si referencias recursos externos via `http://` (no `https://`), el browser los bloqueará en un sitio HTTPS. Verificar que todos los recursos externos usen `https://`.
