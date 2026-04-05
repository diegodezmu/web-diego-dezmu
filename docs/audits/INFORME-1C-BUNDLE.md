# INFORME 1C: Bundle, Build y Baseline

## Resumen ejecutivo
- Baseline ejecutado con `npm run build` (`tsc -b && vite build`) sobre Node `v25.8.1` y npm `11.11.0`.
- Tiempo total de build medido: `1.87 s` wall time; fase reportada por Vite: `208 ms`.
- No hubo warnings de build, pero esto está influido por `chunkSizeWarningLimit: 900`.
- El bundle emitido en `dist/` suma `1,470.60 kB raw` y `518.18 kB gzip` calculado localmente.
- El payload JS+CSS suma `1,277.79 kB raw` y `363.88 kB gzip`.
- El principal problema no es el chunk de entrada, sino `SceneCanvas-CkKe5nhF.js`: `897.61 kB raw`, `240.64 kB gzip`, `71.9%` del JS emitido.
- Hay code splitting para `react-vendor`, `gsap`, `zustand`, `AboutPage`, `StackPage` y `SceneCanvas`.
- Aun así, `SceneCanvas` se renderiza inmediatamente cuando hay WebGL, así que su chunk diferido sigue impactando el arranque real en la mayoría de equipos.
- Lighthouse local fue parcial: `Accessibility 100`, `Best Practices 96`, `SEO 91`; `Performance` no pudo calcularse de forma fiable en headless.
- No existe `vercel.json`; el fallback SPA a `index.html` no está codificado a nivel de repositorio.

## Configuración de Vite

### Archivo leído
- `vite.config.ts`

### Resumen estructurado
- Plugins activos:
  - `@vitejs/plugin-react`
- Build:
  - `chunkSizeWarningLimit: 900`
  - `build.rolldownOptions.output.manualChunks(id)`:
    - `gsap` para módulos bajo `/node_modules/gsap/`
    - `react-vendor` para `react`, `react-dom`, `react-router`, `react-router-dom`
    - `zustand` para `/node_modules/zustand/`
  - No hay configuración explícita de `target`, `minify`, `sourcemap`, `manifest`, `assetsInlineLimit`, `cssCodeSplit` ni `reportCompressedSize`; aplican defaults de Vite.
- Alias de paths:
  - `@` -> `./src`
- Server / preview:
  - No hay bloque `server`
  - No hay bloque `preview`
- Configuración custom relevante:
  - El comentario en config indica que se busca preservar el boundary async de `React.lazy` para `SceneCanvas`.
  - El límite de warning de chunk está elevado respecto al default. Con el default de Vite (`500 kB`), `SceneCanvas` habría disparado warning.

### Assets en Vite
- No hay plugin específico de optimización de imágenes o fuentes.
- No hay `assetsInlineLimit` explícito; en la instalación local de Vite 8 el default es `4096 bytes`.
- Vite hace fingerprinting de assets emitidos, pero no comprime ni convierte imágenes/fuentes por sí mismo.
- En la práctica actual:
  - Las imágenes grandes salen como archivos `.webp`, no inline.
  - La fuente sale como `.ttf` hasheada; no hay conversión a `woff2`.

## Configuración de TypeScript

### Archivos leídos
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`

### Resumen estructurado
- `tsconfig.json`:
  - Proyecto raíz con references a `tsconfig.app.json` y `tsconfig.node.json`
- App (`tsconfig.app.json`):
  - `target: ES2023`
  - `module: ESNext`
  - `moduleResolution: bundler`
  - `jsx: react-jsx`
  - `strict: true`
  - `noEmit: true`
  - `skipLibCheck: true`
  - `types: ["vite/client"]`
  - `baseUrl: "."`
  - `paths: { "@/*": ["./src/*"] }`
  - `allowImportingTsExtensions: true`
  - `verbatimModuleSyntax: true`
  - `moduleDetection: force`
  - `useDefineForClassFields: true`
  - Reglas adicionales: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
- Node / tooling (`tsconfig.node.json`):
  - `target: ES2023`
  - `module: ESNext`
  - `moduleResolution: bundler`
  - `strict: true`
  - `noEmit: true`
  - `types: ["node"]`
  - Misma familia de checks estrictos que la app

## Análisis del bundle

### Comando ejecutado
```bash
npm run build
```

### Resultado del build
- `636` módulos transformados
- Tiempo Vite reportado: `208 ms`
- Tiempo total medido (`/usr/bin/time -lp`): `real 1.87`, `user 3.82`, `sys 0.37`
- Warnings emitidos: ninguno

### Tabla de chunks / assets emitidos
Nota: la columna `gzip` se calculó localmente sobre los archivos emitidos en `dist/`. En assets ya comprimidos como `webp`, el valor gzip no es una métrica de red útil y puede ser similar o ligeramente mayor.

| Nombre | Tamaño raw | Tamaño gzip |
| --- | ---: | ---: |
| `assets/AboutPage-CImqH1eK.js` | 5.15 kB | 1.86 kB |
| `assets/AboutPage-DldxskEV.css` | 1.80 kB | 0.77 kB |
| `assets/gsap-Bcj1aPtk.js` | 69.42 kB | 26.91 kB |
| `assets/index-1F7nnO3a.css` | 25.34 kB | 5.09 kB |
| `assets/index-Sjsgm2B2.js` | 34.30 kB | 10.59 kB |
| `assets/Michroma-Regular-Dh3F2K_p.ttf` | 62.97 kB | 33.16 kB |
| `assets/portrait-desktop-ZG-FnmAC.webp` | 92.91 kB | 92.95 kB |
| `assets/portrait-mobile-BSv-mKej.webp` | 26.02 kB | 26.05 kB |
| `assets/react-vendor-BjAtCQfW.js` | 230.30 kB | 72.76 kB |
| `assets/rolldown-runtime-Dw2cE7zH.js` | 0.69 kB | 0.42 kB |
| `assets/SceneCanvas-CkKe5nhF.js` | 897.61 kB | 240.64 kB |
| `assets/SceneCanvas-gW_YjPDM.css` | 0.59 kB | 0.33 kB |
| `assets/StackPage-eEe85Xvi.css` | 2.25 kB | 0.81 kB |
| `assets/StackPage-Jd2-WYgF.js` | 7.83 kB | 2.62 kB |
| `assets/zustand-CESkXtM2.js` | 2.51 kB | 1.10 kB |
| `favicon.svg` | 9.52 kB | 1.50 kB |
| `index.html` | 1.39 kB | 0.62 kB |
| **TOTAL `dist/`** | **1,470.60 kB** | **518.18 kB** |
| **TOTAL JS+CSS** | **1,277.79 kB** | **363.88 kB** |

### Observaciones clave
- `SceneCanvas-CkKe5nhF.js` representa `71.9%` del JS emitido.
- `react-vendor-BjAtCQfW.js` añade `18.5%` del JS emitido.
- `index-Sjsgm2B2.js` no es excesivo: `34.30 kB raw`, `10.59 kB gzip`.
- El exceso está concentrado en el ecosistema 3D y su escena diferida.

## Estado del code splitting

### Evaluación
- Sí hay splitting manual de vendor:
  - `react-vendor`
  - `gsap`
  - `zustand`
- Sí hay splitting lazy por feature:
  - `AboutPage`
  - `StackPage`
  - `SceneCanvas`
- No hay chunk vendor dedicado para `three`, `@react-three/fiber` y `@react-three/drei`.
- El chunk principal (`index`) es razonable y no es el cuello de botella.
- El chunk realmente problemático es `SceneCanvas`, no el entrypoint.

### Hallazgo importante
- `SceneCanvas` está declarado con `lazy()`, pero en `src/app/AppShell.tsx` se monta inmediatamente cuando `webglSupported` es `true`.
- Eso significa que el chunk 3D está técnicamente separado, pero funcionalmente se descarga al arranque en la ruta inicial para la mayoría de dispositivos con WebGL.

### Recomendaciones específicas
- Separar el stack 3D en un vendor async propio (`three`, `@react-three/fiber`, `@react-three/drei`) para estabilizar caché y aislar cambios de app.
- Retrasar el montaje de `SceneCanvas` hasta después de intro, `idle`, interacción o visibilidad de viewport si la escena no es crítica para FCP.
- Revisar si partes de la escena pueden cargarse por sub-feature o por modo de sección.
- Bajar o reintroducir un budget visible de chunk warnings; con `900 kB` el umbral actual está normalizando un chunk que sigue siendo muy grande.

## Tree-shaking

### Estado actual
- No hay configuración explícita adicional de tree-shaking en `vite.config.ts`.
- La base técnica es buena porque el proyecto usa ESM y Vite/Rolldown hace tree-shaking por defecto.
- En `package.json` del proyecto no existe campo `sideEffects`.

### Dependencias principales revisadas
- `react-router-dom`: `sideEffects: false`
- `gsap`: `sideEffects: false`
- `zustand`: `sideEffects: false`
- `@react-three/fiber`: `sideEffects: false`
- `@react-three/drei`: `sideEffects: false`
- `three`: `sideEffects: ["./src/nodes/**/*"]`
- `react` y `react-dom`: sin campo `sideEffects` declarado

### Conclusión
- Hay condiciones razonables para tree-shaking efectivo en dependencias.
- La ausencia de `sideEffects` en el `package.json` raíz no rompe el build, pero tampoco ayuda a podar con mayor agresividad módulos propios potencialmente puros.
- El problema principal observado no parece ser falta de tree-shaking, sino volumen real del stack 3D que sí se está utilizando.

## Puntuaciones de Lighthouse baseline

### Intentos realizados
- `vite preview` lanzado localmente en `http://127.0.0.1:4177/`
- Primer intento headless: error `NO_FCP`
- Segundo intento headless: reporte parcial válido
- Tercer intento con preset desktop: volvió a fallar con `NO_FCP`

### Baseline local disponible
- Performance: `no calculable de forma fiable en esta máquina/runner`
- Accessibility: `100`
- Best Practices: `96`
- SEO: `91`

### Métricas disponibles del intento parcial
- FCP: `3.1 s`
- Speed Index: `3.1 s`
- CLS: `0`
- LCP: no disponible
- TBT: no disponible

### Nota operativa
- El baseline de Lighthouse queda parcialmente bloqueado por el runner headless local.
- Recomendación: repetir `Performance` post-deploy o en CI con Chrome estable y entorno no interactivo controlado.

## Estado del `index.html`

### Elementos presentes
- `<!doctype html>`
- `<html lang="en">`
- `<meta charset="UTF-8">`
- `<meta name="viewport" ...>`
- `<meta name="description" ...>`
- `<title>`
- favicon SVG
- `preload` de fuente local `Michroma-Regular.ttf`
- `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com`
- stylesheet de Google Fonts para `Heebo`

### Elementos ausentes
- `meta theme-color`
- `meta robots`
- `link rel="canonical"`
- Open Graph (`og:title`, `og:description`, `og:image`, etc.)
- Twitter cards

### Estructura
- La estructura del `head` es correcta y mínima.
- El `body` es limpio: `#root` + script módulo.
- En build, Vite inyecta correctamente:
  - script principal
  - `modulepreload` para `rolldown-runtime`, `react-vendor`, `gsap`, `zustand`
  - stylesheet principal

## Estado de configuración Vercel

### Hallazgo
- No existe `vercel.json` en la raíz.
- No encontré configuración repo-level para:
  - `headers`
  - `redirects`
  - `rewrites`

### Implicación para SPA
- Localmente, `vite preview` responde `200` en `/about`, pero eso no prueba la configuración de Vercel.
- En Vercel, si la app se sirve como estática sin fallback de framework o sin rewrite explícita, las rutas de SPA pueden romper al recargar.
- Ahora mismo el fallback SPA no está codificado en el repositorio.

## Recomendaciones priorizadas por impacto

1. Reducir o diferir `SceneCanvas`.
   - Es el mayor factor de peso real del bundle. Si la escena no es crítica para el primer render, debe cargarse después del contenido primario o tras interacción.

2. Separar vendor 3D de la escena.
   - Crear un chunk async para `three` + `@react-three/fiber` + `@react-three/drei` mejora caché y hace más transparente el coste del stack 3D.

3. Reinstaurar budgets visibles de tamaño.
   - `chunkSizeWarningLimit: 900` evita alertas sobre un chunk que sigue siendo demasiado grande. Conviene bajar el límite o automatizar budgets en CI.

4. Codificar el fallback SPA para Vercel.
   - Añadir `vercel.json` con rewrite a `index.html` elimina ambigüedad operativa en recargas de rutas.

5. Optimizar fuentes.
   - Servir `Michroma` en `woff2` en lugar de `ttf` reduciría bytes y coste de preload.

6. Completar metadatos del `index.html`.
   - Añadir `canonical`, `theme-color`, `robots`, Open Graph y Twitter mejora SEO/social sin tocar el runtime.

7. Automatizar el baseline de Lighthouse.
   - El runner local ha sido inconsistente; mover el baseline a CI o post-deploy dará una medición de `Performance` reproducible.

8. Revisar si conviene declarar `sideEffects` en el paquete raíz.
   - Solo después de auditar imports con efectos laterales y CSS; no es el problema principal, pero puede ayudar a futuro.
