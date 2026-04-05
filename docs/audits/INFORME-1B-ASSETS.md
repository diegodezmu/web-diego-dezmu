# INFORME 1B ASSETS

Fecha de auditoria: 2026-04-05  
Proyecto: `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu`

## Resumen ejecutivo

- Se localizaron 8 assets fisicos relevantes: 1 en `public/`, 0 en `src/` y 7 en `Material/`.
- `src/` no contiene archivos asset con las extensiones auditadas; los SVG usados en UI estan inline en componentes React.
- Hay 4 SVG externos sin referencia en codigo (`Material/icon-*.svg`), funcionalmente duplicados por `src/shared/components/InlineIcons.tsx`.
- Las imagenes raster usadas ya estan en WebP y ninguna supera 500 KB.
- `public/` solo contiene `favicon.svg`; falta el set habitual de favicons raster y `site.webmanifest`.
- No existe una imagen dedicada de Open Graph ni metadatos `og:image`/`twitter:image`.
- Las fuentes se cargan de forma mixta: `Michroma` local y `Heebo` desde Google Fonts.
- `Michroma` solo existe en TTF; para web el formato primario recomendado seria WOFF2.
- `font-display` esta configurado con `swap` tanto en la fuente local como en la URL de Google Fonts.
- Nota de alcance: se incluyen assets de `Material/` porque forman parte real del pipeline y varios estan referenciados desde el codigo.

## Inventario completo de assets

`src/` no contiene archivos asset fisicos con las extensiones auditadas (`.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`, `.ico`, `.svg`, `.woff`, `.woff2`, `.ttf`, `.otf`, `.eot`, `.json` no-config, `.mp4`, `.webm`, audio).

| Ruta | Tipo | Tamano | Dimensiones / formato | ¿Usado? | Evidencia |
| --- | --- | ---: | --- | --- | --- |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/favicon.svg` | SVG | 9.3 KB | 48x46, SVG | Si | `index.html` enlaza `rel="icon"` a `/favicon.svg` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/portrait-desktop.webp` | Imagen raster | 90.7 KB | 480x267, WebP | Si | Importado en `src/shared/assets.ts` y usado en `src/features/pages/AboutPage.tsx` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/portrait-mobile.webp` | Imagen raster | 25.4 KB | 248x141, WebP | Si | Importado en `src/shared/assets.ts` y usado en `src/features/pages/AboutPage.tsx` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/Michroma/Michroma-Regular.ttf` | Fuente | 61.5 KB | TTF | Si | `@font-face` en `src/index.css` y preload en `index.html` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-chevron-left.svg` | SVG | 243 B | 32x32, SVG | No | Sin referencias en `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.html` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-chevron-right.svg` | SVG | 243 B | 32x32, SVG | No | Sin referencias en `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.html` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-zoom-in.svg` | SVG | 806 B | 48x48, SVG | No | Sin referencias en `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.html` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-zoom-out.svg` | SVG | 710 B | 48x48, SVG | No | Sin referencias en `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.html` |

## Assets sin referencia

- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-chevron-left.svg` -> recomendacion: eliminar. El icono equivalente se renderiza inline desde `src/shared/components/InlineIcons.tsx`.
- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-chevron-right.svg` -> recomendacion: eliminar. El icono equivalente se renderiza inline desde `src/shared/components/InlineIcons.tsx`.
- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-zoom-in.svg` -> recomendacion: eliminar. El icono equivalente se renderiza inline desde `src/shared/components/InlineIcons.tsx`.
- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-zoom-out.svg` -> recomendacion: eliminar. El icono equivalente se renderiza inline desde `src/shared/components/InlineIcons.tsx`.

## Imagenes con potencial de optimizacion

No hay imagenes raster por encima de 500 KB y las imagenes usadas ya emplean WebP.

| Archivo | Formato actual | Tamano | Formato recomendado |
| --- | --- | ---: | --- |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/favicon.svg` | SVG compleja con filtros y mascaras | 9.3 KB | Mantener SVG como base, pero generar ademas `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` y una variante SVG mas simple para favicon si se busca maxima compatibilidad |

## Estado de SVGs

| Recurso | Modo de uso | Estado | Metadatos eliminables |
| --- | --- | --- | --- |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/favicon.svg` | Externo | Usado como favicon desde `index.html` | No se detectan etiquetas o firmas de Illustrator, Figma, Sketch, Inkscape o `<metadata>` |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-chevron-left.svg` | Externo | Sin referencia; duplicado funcional de `InlineIcons.tsx` | No se detectan metadatos de editor |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-chevron-right.svg` | Externo | Sin referencia; duplicado funcional de `InlineIcons.tsx` | No se detectan metadatos de editor |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-zoom-in.svg` | Externo | Sin referencia; duplicado funcional de `InlineIcons.tsx` | No se detectan metadatos de editor |
| `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/icon-zoom-out.svg` | Externo | Sin referencia; duplicado funcional de `InlineIcons.tsx` | No se detectan metadatos de editor |
| `src/shared/components/InlineIcons.tsx` | Inline | Usado por `src/features/navigation/PaginationControls.tsx` y `src/features/pages/StackPage.tsx` | No aplica; es SVG embebido en JSX |
| `src/shared/components/CustomCursor.tsx` | Inline | Usado como cursor custom | No aplica; es SVG embebido en JSX |

## Estado de favicons

Existe:

- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/favicon.svg`

Falta:

- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/favicon.ico`
- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/apple-touch-icon.png`
- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/favicon-32x32.png`
- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/favicon-16x16.png`
- `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/public/site.webmanifest`

Estado general:

- Cobertura incompleta para navegadores, pinned tabs y dispositivos iOS.
- `index.html` solo declara `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.

## Estado de imagen OG

- `og:image`: falta.
- `twitter:image`: falta.
- Asset dedicado en `public/`: no encontrado.
- Dimensiones: no aplica, porque no existe imagen OG.
- Cumplimiento del estandar recomendado `1200x630`: no cumple.

## Estado de fuentes

| Fuente | Carga | Ubicacion / origen | Formato | ¿Optimo para web? | `font-display` |
| --- | --- | --- | --- | --- | --- |
| `Michroma` | Local | `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu/Material/Michroma/Michroma-Regular.ttf` | TTF | Parcial. Funciona, pero WOFF2 deberia ser el formato primario | Si, `swap` en `src/index.css` |
| `Heebo` | CDN | `https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap` + `fonts.gstatic.com` | WOFF2 servido por Google Fonts en runtime | Si | Si, `display=swap` en la URL |

Observaciones:

- La estrategia es mixta: tipografia display local (`Michroma`) y tipografia de cuerpo desde CDN (`Heebo`).
- `Michroma` tambien se pre-carga desde `index.html`; en la build actual Vite lo reescribe a un asset fingerprinted en `dist/assets/`, por lo que el preload si entra en el pipeline.
- No hay archivos `woff` o `woff2` locales para `Michroma`; convendria generar al menos `woff2` y dejar `ttf` como fallback opcional.
- No se detectan otras fuentes locales ni referencias a `next/font` o `fontsource`.
