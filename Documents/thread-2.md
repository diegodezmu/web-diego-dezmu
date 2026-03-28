> ⚠️ Documento histórico — puede no reflejar el estado actual del proyecto

# Thread 2 Handoff

## Estado actual

- Proyecto: `web-diego-dezmu`
- Estado de producto al cierre de este hilo: implementación `v3.0` terminada sobre la base `v1`, preparada para staging como segundo hito de repositorio (`v2`).
- Rama/repositorio: repositorio Git local en `main`
- Commit de referencia anterior: `2579c0d`
- Mensaje del commit anterior: `staging: web-diego-dezmu v1`
- Validación técnica cerrada en este hilo:
  - `npm run lint` OK
  - `npm run build` OK
  - comprobación visual local rápida con Playwright en `home` y `about`
  - warning no bloqueante de chunk grande en Vite

## Objetivo de este hilo

Evolucionar la web desde la base `v1` a una nueva versión visual y de comportamiento alineada con el sistema de diseño final de Figma, manteniendo la arquitectura aprobada:

- shell persistente
- canvas WebGL persistente
- capas DOM para contenido, navegación y accesibilidad
- rutas reales `home/about/stack/contact`
- `menu` como overlay global

## Fuentes de verdad usadas

Durante este hilo se trabajó con estas fuentes:

- `Documents/THREAD-1.md`
- `Documents/COPYS.md`
- `Documents/CURVES-CONFIG-3.md`
- `Documents/FIGMA-LINKS-3.md`
- Figma MCP autenticado con la cuenta `diegofmk92@gmail.com`
- Figma file key: `uLdnRDaa6RcUEyL0JcORrb`

Frames/componentes Figma consultados directamente:

- Components `194:754`
- Home desktop `174:946`
- About desktop `174:877`
- Stack 2 desktop `194:660`
- Contact 2 desktop `174:861`
- Menu desktop `174:838`
- Home mobile `189:242`
- Menu mobile `194:911`
- capturas adicionales de `about/stack/contact` desktop y mobile para validación de layout

Decisión cerrada:

- Figma pasa a ser la referencia visual principal.
- Las referencias antiguas del repo quedan como material histórico o auxiliar, no como fuente operativa de implementación.

## Dirección de producto consolidada

La web no se trató como MVP ni prototipo. Se mantuvo la dirección aprobada desde el hilo anterior:

- experiencia definitiva, desktop-first pero con layout mobile real
- renderer híbrido DOM + R3F
- navegación de contenido en DOM
- sistema ambiental/partículas en canvas
- `menu` sin URL propia
- `React + TypeScript + Vite`
- `React Three Fiber` para el sistema de partículas
- `GSAP` para entrances/transiciones DOM
- `Zustand` para estado compartido ligero

## Decisiones nuevas cerradas en este hilo

### Sistema visual

- Se abandonó la identidad basada en logos SVG como UI principal.
- El logo principal pasa a ser texto DOM: `DIEGO DEZMU`.
- El micro-logo pasa a ser texto DOM: `D. DEZMU`.
- `Michroma` se autoalojó desde `Material/Michroma/Michroma-Regular.ttf`.
- El body font quedó configurado como `Heebo` con fallback sans del sistema, porque no se añadió un asset local de `Heebo`.

### Material y assets

- El cursor nuevo pasa a cargarse desde `Material/cursor.svg`.
- Los portraits nuevos se cargan desde:
  - `Material/portrait-desktop.webp`
  - `Material/portrait-mobile.webp`
- Los assets antiguos de `Material/Vectors/*` dejan de ser necesarios para la implementación actual.

### Navegación e interacción

- `Header`, `MenuToggle`, `PaginationControls` y `MenuOverlay` se rediseñaron según Figma.
- El botón superior derecho mantiene la solución robusta basada en texto real `M -> MENU`.
- El cursor gira `90deg` sobre elementos interactivos.
- En mobile se aceptó una navegación con wrap-around entre secciones para acercarse a la referencia visual observada.

### Contacto

- No se aportaron URLs reales para `Instagram / Twitter`.
- Se cerró por defecto esta política:
  - email operativo con `mailto:`
  - texto `Instagram / Twitter` visible pero sin enlace

## Iteraciones de este hilo

### 1. Aterrizaje de contexto

Se revisó:

- el estado heredado desde `THREAD-1`
- la estructura actual de `src/`
- la disponibilidad real de los documentos nuevos
- la conexión del MCP de Figma

Resultado:

- Figma MCP operativo
- documentos base movidos a `Documents/`
- brecha clara entre el estado visual actual y la v3.0 solicitada

### 2. Extracción de diseño desde Figma

Se usó el flujo MCP para obtener:

- contextos estructurados de componentes y pantallas clave
- screenshots desktop/mobile
- tokens visuales relevantes

Hallazgos clave:

- tipografía display `Michroma`
- cuerpo/captions/links en `Heebo`
- nueva paleta oscura estricta
- nueva composición para header, paginación, menú y titles
- `home` ya no depende del logo SVG de partículas
- `stack` y `contact` pasan a tener dos estados

### 3. Replanteamiento de base global

Se rehizo:

- `src/index.css`
- `src/shared/assets.ts`
- `src/config/content.ts`
- `src/shared/types.ts`
- `src/state/appStore.ts`

Cambios clave:

- nuevos tokens globales
- `Michroma` local
- nuevas etiquetas/textos de UI
- nuevos modos de escena
- progreso interno por sección:
  - `aboutScrollProgress`
  - `stackProgress`
  - `contactProgress`

### 4. Replanteamiento de primitives y navegación

Se añadieron primitives nuevas:

- `src/shared/components/PageTitle.tsx`
- `src/shared/components/MicroLogo.tsx`

Y se rehízo:

- `src/features/layout/Header.tsx`
- `src/features/navigation/MenuToggle.tsx`
- `src/features/navigation/PaginationControls.tsx`
- `src/features/menu/MenuOverlay.tsx`

### 5. Reimplementación de pantallas

Se rehicieron:

- `src/features/pages/HomePage.tsx`
- `src/features/pages/AboutPage.tsx`
- `src/features/pages/StackPage.tsx`
- `src/features/pages/ContactPage.tsx`

Estado resultante:

- `home`:
  - wordmark DOM centrado
  - subtítulo `AI BUILDER | PRODUCT DESIGNER`
  - alpha detrás del contenido
- `about`:
  - título centrado
  - scroll interno real
  - copy y portrait según nuevo orden/composición
  - transición a frame de partículas por progreso de scroll
- `stack`:
  - estado 1: título centrado + `gamma`
  - estado 2: título arriba + nebulosa
  - labels insinuados abajo en estado 1
  - labels 3D visibles sólo en desktop/tablet cuando entra la nebulosa
  - eliminado el zoom
  - se mantiene drag 3D
- `contact`:
  - estado 1: título centrado + `delta`
  - estado 2: `deltaOut` + reveal de links
- `menu`:
  - overlay fullscreen centrado
  - close icon DOM animado
  - caption inferior

### 6. Evolución del sistema de partículas

Se rehizo la capa de escena en:

- `src/config/curves.ts`
- `src/config/scenePresets.ts`
- `src/scene/pointSources.ts`
- `src/scene/ParticleScene.tsx`
- `src/scene/ParticleField.tsx`
- `src/scene/StackLabels.tsx`

Modos de escena activos ahora:

- `homeAlpha`
- `aboutBeta`
- `aboutFrame`
- `stackGamma`
- `stackNebula`
- `contactDelta`
- `contactDeltaOut`
- `menuGrid`

Decisiones cerradas de escena:

- `home` ya no muestrea un SVG; usa la curva `alpha`
- `about` mezcla `beta -> frame`
- `stack` mezcla `gamma -> nebula`
- `contact` mezcla `delta -> deltaOut`
- `menu` usa un grid fullscreen
- se añadió glow reactivo al cursor vía intensidad por partícula
- las curvas respetan la cadena del skill `lissajous-synt`:
  - `sin -> cross mod -> wavefold -> ring mod -> sample/scale`

## Conflictos y problemas encontrados

### 1. Desfase entre diseño nuevo y base previa

Problema:

- la base heredada todavía respondía a una dirección visual anterior
- seguía habiendo dependencia conceptual de logos SVG, tokens previos y estados de escena viejos

Resolución:

- se rehízo la base visual y de escena en vez de intentar parchearla localmente

### 2. Disponibilidad de tipografías

Problema:

- `Michroma` no estaba inicialmente en el repo

Resolución:

- el usuario añadió `Material/Michroma/Michroma-Regular.ttf`
- se integró como fuente local

Problema residual:

- `Heebo` no está autoalojada en el repo

Decisión:

- fallback a sistema para body/captions/links

### 3. Contrato de partículas más complejo

Problema:

- la escena anterior estaba diseñada para `logo/aboutCurve/aboutFrame/stackCloud/contactCurve/menuFlood`
- la nueva especificación exigía más estados y blends

Resolución:

- se redefinieron modos, presets, progresos y generación de nubes/curvas

### 4. Reglas de lint de React sobre mutabilidad

Problema:

- el linter bloqueó la mutación de buffers creados desde hooks

Resolución:

- los buffers de trabajo y el snapshot de escena se movieron a refs/effects compatibles con las reglas activas

### 5. Links sociales no entregados

Problema:

- Figma mostraba `Instagram / Twitter` pero el repo no contenía URLs reales

Resolución:

- se dejó el texto visible sin enlace

## Cambios estructurales relevantes del repo

### Documentación

En este punto del repo la documentación operativa vive en `Documents/`:

- `Documents/THREAD-1.md`
- `Documents/COPYS.md`
- `Documents/CURVES-CONFIG-3.md`
- `Documents/FIGMA-LINKS-3.md`
- `Documents/PRD-INICIAL.md`

Se detectó además limpieza/movimiento de material legado:

- borrado de docs antiguas en raíz
- borrado de referencias visuales antiguas en `Material/UI-*`, `Material/Reference images`, `Material/Vectors`

### Material auxiliar no conectado al código

Hay referencias nuevas auxiliares no consumidas por la app en este hilo:

- `Visual-references/Instancia3.jpg`
- `Visual-references/Instancia7.jpg`

## Estado final del código

Áreas clave tocadas:

- shell y layout global
- navegación y menú
- páginas `home/about/stack/contact`
- configuración de curvas/presets
- generación de point clouds
- store central
- cursor
- nuevos primitives DOM

## Validación cerrada

- `npm run lint` OK
- `npm run build` OK
- comprobación local en navegador:
  - `home`
  - `about`

## Riesgos y follow-ups recomendados

- hacer revisión visual completa frame a frame para:
  - `stack1`
  - `stack2`
  - `contact1`
  - `contact2`
  - `menu`
  - mobile completo
- decidir si `Heebo` debe añadirse como asset local para paridad visual total
- decidir si `Instagram / Twitter` deben tener URLs reales
- si el bundle importa demasiado para staging, evaluar code-splitting; ahora mismo sólo hay warning, no bloqueo

## Nota para el siguiente hilo

Si el siguiente hilo parte de este estado, el punto correcto de entrada es:

- validar la fidelidad visual final contra Figma en todas las pantallas
- cerrar detalles de polish/motion
- o desplegar/iterar ya sobre esta base `v2` de staging
