> ⚠️ Documento histórico — puede no reflejar el estado actual del proyecto

# Thread 1 Handoff

## Estado actual

- Proyecto: `web-diego-dezmu`
- Estado de producto: base `V1` preparada para staging
- Rama/repositorio: repositorio Git inicializado localmente en `main`
- Commit de referencia: `2579c0d`
- Mensaje del commit: `staging: web-diego-dezmu v1`
- Estado del workspace al cerrar este hilo:
  - árbol Git limpio salvo un cambio local ya existente en `CAMBIOS.3.md`
  - `npm run lint` OK
  - `npm run build` OK
  - warning no bloqueante de chunk grande en Vite/Three/R3F

## Contexto de producto y dirección

El sitio no se planteó como MVP ni prototipo. La dirección aprobada fue una web definitiva, desktop-first, con shell persistente, canvas WebGL persistente y capas DOM para contenido, navegación y accesibilidad.

Se trabajó con estas fuentes de verdad:

- `PRD.md`
- `COPYS.md`
- configuraciones de curvas (`CURVES-CONFIG...`)
- carpeta `Material`
- referencias `UI-web`, `UI-mobile`, `Reference images`, `Schemas`
- enlaces Figma aportados durante el hilo

Conclusión de producto cerrada desde el inicio:

- shell minimalista y permanente
- rutas reales para `home`, `about`, `stack`, `contact`
- `menu` como overlay global, no como ruta
- `React + TypeScript + Vite`
- `React Three Fiber` para el sistema de partículas
- `GSAP` para transiciones y scroll de `about`
- `Zustand` para estado compartido ligero

## Arquitectura implementada

### Shell

- Shell persistente en `src/app/AppShell.tsx`
- Canvas persistente en `src/scene/SceneCanvas.tsx`
- Escena principal en `src/scene/ParticleScene.tsx`
- Estado central en `src/state/appStore.ts`

### Secciones visuales

- `home`: logo de partículas
- `about`: curva alpha + transición por scroll a frame rectangular
- `stack`: nube 3D con labels de skills
- `contact`: curva beta + CTA mail
- `menu`: overlay fullscreen con `menuFlood`

### Lógica de escena

`SceneMode` activo:

- `logo`
- `aboutCurve`
- `aboutFrame`
- `stackCloud`
- `contactCurve`
- `menuFlood`

Presets centralizados en `src/config/scenePresets.ts`.

## Iteración 1: base funcional

Primera fase cerrada:

- estructura del proyecto
- router
- shell persistente
- canvas R3F persistente
- páginas `home/about/stack/contact`
- menú global
- cursor custom
- pipeline de partículas y morphs por sección

Decisiones relevantes:

- toda la navegación de contenido en DOM
- toda la capa viva/ambiental en canvas
- `menu` sin URL propia
- `stack` guiado, sin órbita libre clásica

## Iteración 2: ajuste Figma + retune inicial

Se pidió una primera ronda fuerte de ajuste visual y de partículas.

Cambios cerrados en esa fase:

- reducción general de tamaños UI
- revisión de tipografía y spacing
- eliminación de etiquetas de categorías en `stack`
- `alpha`, `aboutFrame` y `beta` dejaron de comportarse como contornos finos
- home casi estática
- reducción de radio de repulsión general
- ocultación de cursor nativo
- corrección del bug donde el menú dejaba ver elementos de la página anterior

Conflictos detectados:

- el botón de menú no revelaba bien el texto
- la paginación lateral interceptaba clics en la esquina superior
- el overlay de `about` teñía demasiado el canvas

Resolución de esa fase:

- se subió el `z-index` del header por encima de la paginación
- se rehizo el botón superior derecho con máscara
- el overlay de `about` se restringió al área de contenido

## Iteración 3: ajustes adicionales sobre referencia desktop

Luego se pidió una nueva ronda de correcciones:

- revisión general contra Figma y capturas
- home con logo más pequeño en ese momento
- paginación más estrecha
- bloque inicial de `about` empezando a mitad de pantalla
- nueva foto
- `stack` más contenido en ancho
- menú centrado
- curvas más pequeñas
- opacidad global de partículas al 70%

Cambios implementados entonces:

- `assets.portraitUrl` apuntó a un retrato nuevo
- tokens de tipografía reducidos
- menú overlay centrado
- labels de `stack` sólo para skills
- `alpha` y `beta` reducidas
- frame de `about` rehecho como banda más uniforme
- menú y home revalidados con Playwright

Conflicto importante de esa fase:

- el botón superior con SVG/wordmark y máscara no terminaba de comportarse bien en reposo/hover

Se optó por una solución robusta basada en texto real:

- estado base: `M`
- hover: `MENU`
- línea vertical separada con gap controlado

## Iteración 4: grid 72px + shell + particles v3

Esta fue la última iteración grande del hilo y es la que define el estado actual.

### Decisión de layout

Se bloqueó este criterio:

- frame interior en desktop de `72px`
- escalado responsive:
  - `72px` desktop
  - `48px` tablet
  - `24px` mobile

Interpretación cerrada del margen:

- no es una banda completamente vacía
- es un carril de shell
- contenido y composición visual deben respetarlo
- los controles laterales sí pueden vivir dentro de ese carril

### Cambios implementados

#### Tokens y shell

- `src/index.css`
  - `--frame-margin-desktop: 72px`
  - `--frame-margin-tablet: 48px`
  - `--frame-margin-mobile: 24px`
  - `--frame-margin` como token operativo
- header, pages, menú y captions reanclados a `var(--frame-margin)`

#### Header

- micro logo siempre visible mientras el menú no está abierto
- micro logo y botón superior derecho alineados a `72px`

#### Paginación lateral

- dejó de ocupar la altura completa visualmente
- pasó a ser un rectángulo centrado verticalmente
- tamaño de tipografía e icono reducido
- hover limitado al bloque del control

#### Home

- logo principal recalibrado a ~`60vw`
- cambio clave en partículas:
  - se dejó de muestrear el contorno del SVG
  - se implementó muestreo por área llena con canvas en `sampleSvgAreaPoints`
  - objetivo: letras llenas, no sólo bordeadas

#### About

- `about` inicial:
  - overlay ancho completo dentro del frame interior
  - hero a mitad de pantalla
- `about` scrolled:
  - frame de partículas alineado al frame interior completo
  - transición más temprana de `aboutCurve` a `aboutFrame`
- separación entre foto y copy reducida
- gap entre párrafos fijado a `16px`

#### Curvas alpha y beta

- ambas se redujeron al 50% de su tamaño en ese estado del proyecto
- se mantuvo densidad suficiente para evitar sensación de vacío

#### Stack

- se añadió `drift` real al contrato de escena
- `ScenePreset` y `SceneSnapshot` se extendieron con `drift`
- `stackCloud` recibió:
  - `orbit` bajo
  - `drift` bajo
- se eliminó el doble suavizado de cámara:
  - `stackView` define targets
  - `ParticleScene` deja los targets directos
  - la cámara interpola una sola vez
- se corrigió el wheel pasivo:
  - se pasó a listener nativo `passive: false`
  - desapareció el error de consola al hacer zoom

#### Menú

- `menuFlood` actualizado a:
  - `pointerRadiusPx: 240`
  - `pointerStrength: 0.24`
  - `opacity: 0.60`
- hover de ítems:
  - sólo el item hoverado queda encendido
  - el activo previo deja de quedarse iluminado
  - crecimiento por `font-size` en hover

#### Cursor

- se mantuvo el path `Material/Vectors/cursor.svg`
- se reajustó el tamaño del cursor a las dimensiones reales del SVG nuevo

## Problemas y conflictos encontrados

### 1. Figma MCP con `429`

Problema:

- los accesos al frame Figma actualizado devolvieron `429 Too Many Requests`

Decisión:

- continuar usando como fuente operativa:
  - `Material/UI-web`
  - `Material/UI-mobile`
  - imágenes adjuntas en el hilo

### 2. Asset roto del retrato

Problema detectado al preparar staging:

- `src/shared/assets.ts` importaba `../../Material/portrait.webp`
- ese fichero ya no existía

Estado real de `Material`:

- `portrait-desktop.webp`
- `portrait-mobile.webp`

Resolución:

- `assets.ts` se corrigió para usar `../../Material/portrait-desktop.webp`

Este fue el único bloqueo real de staging al cerrar el hilo.

### 3. Menú superior derecho

Se probaron varias estrategias:

- máscara con texto completo deslizándose
- uso de `menu.svg`
- combinación de `M` fija + cola `ENU`

Decisión final:

- mantener `M` fija
- revelar `ENU` por máscara
- esta solución fue la más controlable y estable

### 4. Paginación lateral vs header

Problema:

- la paginación interceptaba clics del botón superior derecho

Resolución:

- header por encima en stacking
- paginación redimensionada y reubicada
- hover y hit-area más contenidos

### 5. `about` overlay

Problema:

- inicialmente sólo cubría zona central o ensuciaba el canvas

Resolución final:

- overlay DOM ancho completo dentro del frame interior
- transición de opacidad temprana al empezar scroll
- sin velar el canvas de partículas

## Hitos verificados durante el hilo

- `home`, `about`, `stack`, `contact`, `menu` navegables
- canvas persistente sin remount por ruta
- menú como estado exclusivo sobre la shell
- `about` inicial y `about` scrolled validados con capturas
- hover del menú validado con Playwright
- `stack` validado tras eliminar error de wheel pasivo
- `npm run lint` y `npm run build` repetidos múltiples veces y cerrados en verde al final

## Estado técnico final al cierre del hilo

### Versionado

- `package.json` quedó en `1.0.0`
- commit de referencia: `2579c0d`

### Validación de entrega

- `npm run lint` OK
- `npm run build` OK

### Warning pendiente

- Vite sigue reportando warning por tamaño de chunk del bundle principal
- no bloquea staging
- no se abordó code-splitting en este hilo

## Archivos clave tocados durante el hilo

No es inventario exhaustivo de cada cambio, pero estos son los núcleos importantes:

- `src/app/AppShell.tsx`
- `src/index.css`
- `src/shared/assets.ts`
- `src/state/appStore.ts`
- `src/config/scenePresets.ts`
- `src/config/curves.ts`
- `src/features/layout/Header.tsx`
- `src/features/layout/Header.module.css`
- `src/features/navigation/MenuToggle.tsx`
- `src/features/navigation/MenuToggle.module.css`
- `src/features/navigation/PaginationControls.tsx`
- `src/features/navigation/PaginationControls.module.css`
- `src/features/menu/MenuOverlay.tsx`
- `src/features/menu/MenuOverlay.module.css`
- `src/features/pages/AboutPage.tsx`
- `src/features/pages/AboutPage.module.css`
- `src/features/pages/HomePage.module.css`
- `src/features/pages/ContactPage.module.css`
- `src/features/pages/StackPage.tsx`
- `src/features/pages/StackPage.module.css`
- `src/scene/ParticleScene.tsx`
- `src/scene/ParticleField.tsx`
- `src/scene/pointSources.ts`
- `src/scene/types.ts`
- `src/shared/components/CustomCursor.module.css`

## Decisiones cerradas que no deberían reabrirse sin motivo

- arquitectura DOM + R3F persistente
- `menu` como overlay, no ruta
- carril de shell `72/48/24`
- micro logo visible fuera del menú
- `M` en reposo y `MENU` en hover
- `aboutFrame` alineado al frame interior
- `stack` con movimiento sutil, no estático total
- categories de `stack` eliminadas; sólo skill labels

## Pendientes razonables para el siguiente hilo

- configurar remoto Git y `push`
- preparar deploy/preview real de staging
- optimización de bundle:
  - code-splitting
  - lazy-loading de escena si se desea
- revisión visual fina adicional si aparecen nuevas referencias Figma sin rate limit
- decidir si `portrait-mobile.webp` debe integrarse condicionalmente en mobile

## Nota operativa

Al crear este handoff, el workspace seguía mostrando:

- cambio local en `CAMBIOS.3.md`

No se ha modificado ni normalizado ese archivo en esta operación.
