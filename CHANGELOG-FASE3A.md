# CHANGELOG FASE 3A

## Tabla de chunks antes vs después

Medidas en tamaño raw reportadas por Vite.

| Nombre | Tamaño antes | Tamaño después |
| --- | ---: | ---: |
| `AboutPage.css` | 1.80 kB | 1.80 kB |
| `AboutPage.js` | 5.15 kB | 5.15 kB |
| `gsap.js` | 69.42 kB | 69.42 kB |
| `index.css` | 25.34 kB | 25.86 kB |
| `index.js` | 34.30 kB | 34.33 kB |
| `react-vendor.js` | 230.30 kB | 230.29 kB |
| `rolldown-runtime.js` | 0.69 kB | 0.68 kB |
| `SceneCanvas.css` | 0.59 kB | 0.59 kB |
| `SceneCanvas.js` | 897.61 kB | 26.10 kB |
| `StackPage.css` | 2.25 kB | 2.25 kB |
| `StackPage.js` | 7.83 kB | 7.83 kB |
| `three-vendor.js` | - | 873.74 kB |
| `zustand.js` | 2.51 kB | 0.43 kB |

Observación principal:
- El peso 3D ya no vive en `SceneCanvas`; se desplazó a `three-vendor`, dejando el código propio de `src/scene/*` en un chunk pequeño y cacheable por separado del vendor.

## Cambios en vite.config

- Se añadió `manualChunks()` para crear `three-vendor` con `three`, `@react-three/fiber` y `@react-three/drei`.
- Se mantuvieron los chunks existentes `react-vendor`, `gsap` y `zustand`.
- No se tocó la frontera `React.lazy()` ni la estrategia de montaje inmediato de `SceneCanvas`.
- `chunkSizeWarningLimit` se ajustó de `900` a `962`.
  Motivo: tras el split, el chunk más grande real es `three-vendor` con `873.74 kB` raw. El nuevo límite deja un margen del 10% sobre ese tamaño y evita normalizar el exceso con un presupuesto arbitrario.
- No se añadió `"sideEffects": false` en `package.json`.
  Motivo: el proyecto tiene imports de CSS en módulos propios, incluyendo el import global de `src/index.css` desde `src/main.tsx`. Un flag global de `sideEffects: false` sería demasiado agresivo y no está verificado como seguro.

## Estado de la migración de fuentes

Archivos creados en `src/assets/fonts/`:
- `Michroma-Regular.woff2`
- `Heebo-Latin-400.woff2`
- `Heebo-Latin-500.woff2`
- `Heebo-Latin-700.woff2`

Declaraciones actualizadas:
- `src/index.css` ahora declara `Michroma` con `woff2` como formato primario y `ttf` como fallback.
- `src/index.css` ahora declara `Heebo` local en pesos `400`, `500` y `700`, todos con `font-display: swap`.
- `index.html` ahora hace preload de `Michroma-Regular.woff2` y `Heebo-Latin-400.woff2`.

Verificación de emisión en build:
- `dist/assets/Heebo-Latin-400-BGyEuwIV.woff2`
- `dist/assets/Heebo-Latin-500-CRntKADR.woff2`
- `dist/assets/Heebo-Latin-700-PoyjiH5f.woff2`
- `dist/assets/Michroma-Regular-DgupiqI2.woff2`
- `dist/assets/Michroma-Regular-Dh3F2K_p.ttf`

## Dependencias externas eliminadas

Se eliminaron de `index.html`:
- `preconnect` a `https://fonts.googleapis.com`
- `preconnect` a `https://fonts.gstatic.com`
- stylesheet remota de Google Fonts para `Heebo`

Resultado:
- La tipografía ya no depende de requests externos en tiempo de ejecución.

## Tamaño total de dist antes vs después

| Métrica | Antes | Después |
| --- | ---: | ---: |
| `TOTAL dist/ raw` | 1,470.60 kB | 1,496.31 kB |
| `TOTAL dist/ gzip` | 518.18 kB | 566.06 kB |
| `TOTAL JS+CSS raw` | 1,277.79 kB | 1,248.56 kB |
| `TOTAL JS+CSS gzip` | 363.88 kB | 355.84 kB |

Lectura del resultado:
- El payload `JS+CSS` baja tras separar el vendor 3D y sacar tipografías remotas del critical path.
- El total de `dist/` sube porque ahora el build empaqueta `Heebo` local en tres pesos y mantiene `Michroma` en doble formato (`woff2` + `ttf` fallback).

## Verificaciones adicionales

- `npm run build` ejecutado con éxito tras los cambios.
- Solo existe un `<img>` en el proyecto, el retrato de `AboutPage`, y no usa `loading="lazy"`. No fue necesario tocar componentes: no hay otras imágenes below the fold que requieran ajuste en esta fase.
