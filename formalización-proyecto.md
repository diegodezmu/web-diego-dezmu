# formalización-proyecto

## 1. Objetivo y alcance

Documento de formalización técnica del repositorio `web-diego-dezmu` como base para una auditoría posterior. El objetivo de este documento es describir fielmente qué existe hoy en el proyecto, cómo está organizado y qué decisiones técnicas son detectables sin entrar todavía en una valoración exhaustiva de calidad.

- Fecha de análisis: `2026-04-04`
- Ruta analizada: `/Users/diegofernandezmunoz/Developer/personal/web-diego-dezmu`
- Estado del worktree durante el análisis: con cambios pendientes en `Documents/` (borrados no confirmados)
- Validación ejecutada sobre este worktree:
  - `npm run lint` -> OK
  - `npm run build` -> OK
  - `npm test` -> OK (`4` archivos de test, `16` tests)

## 2. Resumen ejecutivo

El repositorio contiene una aplicación frontend single-page construida con React 19, Vite 8 y TypeScript 5.9, con routing por secciones y una escena WebGL persistente implementada con Three.js + React Three Fiber. La arquitectura real no es solo la de una SPA con páginas: el núcleo visual del proyecto es un motor de partículas basado en `Float32Array`, presets de escena y morphing por frame, sincronizado con el contenido DOM mediante un store global de Zustand.

No hay backend, API server, base de datos, variables de entorno ni lógica de despliegue específica dentro del repo. Sí hay CI en GitHub Actions y un pipeline de validación estándar (`lint`, `build`, `test`).

## 3. Inventario observable del repositorio

### 3.1. Superficie de código

- `src/`: `58` archivos
  - `21` archivos `.tsx`
  - `21` archivos `.ts`
  - `15` archivos `.module.css`
  - `1` archivo de tipado Vite (`vite-env.d.ts`)
- `tests/`: `4` archivos
- `Material/`: assets locales de imagen, SVG y tipografía
- `public/`: favicon
- `.github/workflows/ci.yml`: pipeline CI

### 3.2. Lo que sí existe

- Shell de aplicación y routing
- Store global de UI/escena con Zustand
- Escena WebGL persistente con R3F/Three.js
- Configuración centralizada de copy, curvas y presets
- Animación DOM con GSAP
- Fallback visual cuando no hay WebGL
- Tests unitarios de utilidades/configuración/generadores

### 3.3. Lo que no aparece en el repo actual

- Backend o servidor propio
- API client dedicado
- Integración con CMS
- Variables de entorno o `.env`
- Configuración de despliegue (`vercel.json`, Docker, etc.)
- Persistencia de estado en storage
- E2E tests o integración visual automatizada

## 4. Stack tecnológico con versiones

Las versiones de esta sección combinan:

- rango declarado en `package.json`
- versión resuelta en `package-lock.json`
- observación del entorno local donde se ejecutó la validación

### 4.1. Plataforma y entorno

| Elemento | Declarado | Observado / resuelto | Uso en el proyecto |
| --- | --- | --- | --- |
| Node.js | `>=20.19.0` | `.nvmrc`: `25.8.1`, entorno local: `v25.8.1` | Runtime de desarrollo, CI y build |
| npm | no fijado | `11.11.0` | Gestión de dependencias y scripts |
| `package-lock.json` | n/a | `lockfileVersion: 3` | Resolución reproducible |

### 4.2. Dependencias runtime directas

| Paquete | Declarado | Resuelto | Uso detectable |
| --- | --- | --- | --- |
| `react` | `^19.2.4` | `19.2.4` | UI principal |
| `react-dom` | `^19.2.4` | `19.2.4` | Renderizado DOM |
| `react-router-dom` | `^7.9.6` | `7.13.1` | Routing declarativo por secciones |
| `zustand` | `^5.0.8` | `5.0.12` | Store global de app/escena |
| `three` | `^0.181.1` | `0.181.2` | Motor 3D base |
| `@react-three/fiber` | `^9.4.0` | `9.5.0` | Integración React con Three.js |
| `@react-three/drei` | `^10.7.7` | `10.7.7` | `Html` para labels 3D proyectadas |
| `gsap` | `^3.13.0` | `3.14.2` | Animaciones DOM y tweening de transición |

### 4.3. Tooling y desarrollo

| Paquete | Declarado | Resuelto | Uso detectable |
| --- | --- | --- | --- |
| `vite` | `^8.0.1` | `8.0.1` | Bundler y dev server |
| `@vitejs/plugin-react` | `^6.0.1` | `6.0.1` | Integración React para Vite |
| `typescript` | `~5.9.3` | `5.9.3` | Tipado estático |
| `vitest` | `^4.1.2` | `4.1.2` | Tests unitarios |
| `eslint` | `^9.39.4` | `9.39.4` | Linting |
| `@eslint/js` | `^9.39.4` | `9.39.4` | Config base ESLint |
| `typescript-eslint` | `^8.57.0` | `8.57.1` | Reglas TypeScript en ESLint |
| `eslint-plugin-react-hooks` | `^7.0.1` | `7.0.1` | Reglas de hooks |
| `eslint-plugin-react-refresh` | `^0.5.2` | `0.5.2` | Reglas orientadas a Vite/React Refresh |
| `globals` | `^17.4.0` | `17.4.0` | Globals browser en ESLint |
| `@types/node` | `^24.12.0` | `24.12.0` | Tipos Node |
| `@types/react` | `^19.2.14` | `19.2.14` | Tipos React |
| `@types/react-dom` | `^19.2.3` | `19.2.3` | Tipos React DOM |
| `@types/three` | `^0.181.0` | `0.181.0` | Tipos Three.js |

### 4.4. Infraestructura y servicios externos detectables

| Elemento | Versión / fuente | Uso detectable |
| --- | --- | --- |
| GitHub Actions | `actions/checkout@v4`, `actions/setup-node@v4` | CI en push/PR a `main` |
| Google Fonts | `Heebo` | Tipografía body cargada en `index.html` |
| Tipografía local | `Michroma-Regular.ttf` | Tipografía display cargada desde `Material/` |

## 5. Arquitectura general del proyecto

### 5.1. Modelo de alto nivel

El proyecto está organizado como una SPA con dos capas principales que conviven en tiempo real:

1. Capa DOM de contenido y navegación.
2. Capa WebGL persistente con una escena de partículas que no se desmonta al cambiar de ruta.

El contenido textual y la navegación se resuelven por rutas (`/`, `/about`, `/stack`, `/contact`), mientras que la escena 3D se mantiene viva por detrás y cambia de comportamiento mediante un snapshot recalculado por frame.

### 5.2. Flujo principal de arranque

1. `src/main.tsx` monta React con `StrictMode`.
2. `src/App.tsx` envuelve `AppShell` con `BrowserRouter`.
3. `src/app/AppShell.tsx` coordina:
   - ruta activa
   - capacidad del dispositivo
   - menú overlay
   - intro curtain
   - fallback sin WebGL
   - carga diferida de páginas pesadas y de la escena

### 5.3. Gestión de estado

Todo el estado compartido relevante vive en `src/state/appStore.ts` mediante Zustand. El store centraliza:

- sección activa
- modo de escena
- menú abierto / overlay activo
- estado de intro
- `contentRevealKey`
- puntero y modo cursor
- capacidades del dispositivo
- estado de hold/explode
- progreso de las secciones `about`, `contact` y `stack`
- cámara orbital del mapa de stack
- zoom del stack

No hay slices separados, persistencia ni middlewares.

### 5.4. Arquitectura visual

#### Capa DOM

- `Header`
- `MenuToggle`
- `PaginationControls`
- `MenuOverlay`
- páginas `Home`, `About`, `Stack`, `Contact`
- cursor custom y títulos reutilizables

#### Capa WebGL

- `SceneCanvas` monta un único `<Canvas>`
- `ParticleScene` compone:
  - `ParticleField`
  - `StackEmbeddingMap`
- `useSceneSnapshot` calcula por frame:
  - posiciones objetivo
  - blend entre escenas
  - tamaño/opacidad/glow
  - pointer interaction
  - cámara
- `useSceneCamera` interpola la cámara real de Three.js hacia el snapshot

### 5.5. Pipeline de escena

El flujo interno del motor visual es:

1. Configuración base en `src/config/curves.ts` y `src/config/scenePresets.ts`.
2. Ajuste por device tier con `getPresetForTier`.
3. Generación geométrica con helpers de `src/scene/generators/*`.
4. Resolución de modulación LFO en `src/scene/lfo.ts`.
5. Cálculo continuo del `SceneSnapshot` en `src/scene/useSceneSnapshot.ts`.
6. Interpolación y render de partículas en `src/scene/ParticleField.tsx`.
7. Render auxiliar del mapa 3D de stack y labels HTML proyectadas.

### 5.6. Estrategia de carga y build

La build usa Vite 8 con:

- alias `@ -> ./src`
- `React.lazy` para `SceneCanvas`, `AboutPage` y `StackPage`
- `Suspense` para trocear la carga
- `manualChunks` para:
  - `gsap`
  - `react-vendor`
  - `zustand`
- chunk warning elevado a `900` kB porque la escena R3F se entrega como payload asíncrono dedicado

Resultado observado de build:

- chunk principal `index`: `30.02 kB`
- chunk `react-vendor`: `230.29 kB`
- chunk asíncrono `SceneCanvas`: `896.66 kB`

## 6. Árbol de componentes y módulos con su función

### 6.1. Árbol de alto nivel

```text
src/
  App.tsx
  main.tsx
  index.css
  app/
    AppShell.tsx
    IntroCurtain.tsx
  config/
    content.ts
    curves.ts
    scenePresets.ts
  features/
    layout/
      Header.tsx
    menu/
      MenuOverlay.tsx
    navigation/
      MenuToggle.tsx
      PaginationControls.tsx
    pages/
      HomePage.tsx
      AboutPage.tsx
      StackPage.tsx
      ContactPage.tsx
      stack/
        useStackCamera.ts
        useStackGestures.ts
        useStackTransition.ts
  scene/
    SceneCanvas.tsx
    ParticleScene.tsx
    ParticleField.tsx
    StackEmbeddingMap.tsx
    StackLabels.tsx
    useSceneCamera.ts
    useSceneSnapshot.ts
    lfo.ts
    types.ts
    generators/
      bufferTransforms.ts
      curves.ts
      grids.ts
      shared.ts
      stackEmbedding.ts
  shared/
    assets.ts
    types.ts
    components/
      CustomCursor.tsx
      InlineIcons.tsx
      MicroLogo.tsx
      PageTitle.tsx
    utils/
      device.ts
      webgl.ts
  state/
    appStore.ts
tests/
  config/scenePresets.test.ts
  scene/generators/bufferTransforms.test.ts
  scene/generators/curves.test.ts
  shared/utils/device.test.ts
```

Nota: la mayoría de componentes visuales tienen un `.module.css` homónimo co-localizado. No se listan individualmente en la tabla siguiente para no duplicar información estructural.

### 6.2. Bootstrap y shell

| Ruta | Función |
| --- | --- |
| `src/main.tsx` | Punto de entrada. Monta React en `#root` con `StrictMode`. |
| `src/App.tsx` | Envuelve la aplicación con `BrowserRouter`. |
| `src/app/AppShell.tsx` | Shell central. Orquesta rutas, escena, fallback sin WebGL, intro, menú overlay, puntero y carga diferida. |
| `src/app/IntroCurtain.tsx` | Overlay inicial sincronizado con animación CSS y finalización de intro. |
| `src/index.css` | Tokens globales, tipografías, reset, variables visuales y reglas responsive globales. |

### 6.3. Configuración y contenido

| Ruta | Función |
| --- | --- |
| `src/config/content.ts` | Copy del sitio, labels de navegación, email/socials, color global de partículas y taxonomía del stack. |
| `src/config/curves.ts` | Definición de escenas base (`alpha`, `beta`, `gamma`, `delta`), tuning de partículas y configuraciones auxiliares de grid. |
| `src/config/scenePresets.ts` | Presets por modo de escena, escalado por device tier y mapeo sección -> modo. |
| `src/shared/types.ts` | Tipos compartidos de secciones, capacidades, curvas, partículas, LFO, stack y presets. |

### 6.4. Layout, navegación y overlay

| Ruta | Función |
| --- | --- |
| `src/features/layout/Header.tsx` | Cabecera superior; muestra logo contextual y botón de menú. |
| `src/features/navigation/MenuToggle.tsx` | Botón de apertura del menú. |
| `src/features/navigation/PaginationControls.tsx` | Navegación lateral/móvil entre secciones anterior/siguiente. |
| `src/features/menu/MenuOverlay.tsx` | Menú modal full-screen con focus management, cierre por `Escape` y navegación programática. |

### 6.5. Páginas y hooks específicos

| Ruta | Función |
| --- | --- |
| `src/features/pages/HomePage.tsx` | Hero principal con nombre y roles. |
| `src/features/pages/AboutPage.tsx` | Página scrollable con copy biográfica, retrato responsive y control wheel/touch/click sobre el título. |
| `src/features/pages/StackPage.tsx` | Página del stack con transición curva -> mapa 3D, hint de orbit y controles de zoom. |
| `src/features/pages/ContactPage.tsx` | Página de contacto con reveal progresivo por wheel/touch. |
| `src/features/pages/stack/useStackCamera.ts` | Lógica de órbita, damping, inercia y zoom del mapa de stack. |
| `src/features/pages/stack/useStackGestures.ts` | Gestos de wheel/pointer/touch para alternar estados y orbitar el mapa. |
| `src/features/pages/stack/useStackTransition.ts` | Tween GSAP del progreso `0 -> 1` del stack y sincronización con `sceneMode`. |

### 6.6. Escena y motor visual

| Ruta | Función |
| --- | --- |
| `src/scene/SceneCanvas.tsx` | Monta el `<Canvas>` de R3F y ajusta DPR por device tier. |
| `src/scene/ParticleScene.tsx` | Composición de la escena: partículas + mapa de stack. |
| `src/scene/useSceneCamera.ts` | Interpola la cámara de Three hacia los valores calculados en el snapshot. |
| `src/scene/useSceneSnapshot.ts` | Núcleo del motor. Calcula buffers, blends, cámara, progresos y modos por frame. |
| `src/scene/ParticleField.tsx` | Render de partículas y actualización continua de posiciones/colores/material por frame. |
| `src/scene/StackEmbeddingMap.tsx` | Render de la rejilla cúbica del mapa de stack y activación de labels. |
| `src/scene/StackLabels.tsx` | Labels HTML proyectadas con `Html` de Drei y fade controlado por cámara/visibilidad. |
| `src/scene/lfo.ts` | Sistema de modulación LFO para parámetros de curvas y partículas. |
| `src/scene/types.ts` | Tipos internos del snapshot y del stack 3D. |

### 6.7. Generadores de geometría y buffers

| Ruta | Función |
| --- | --- |
| `src/scene/generators/shared.ts` | RNG determinista, gaussianas, hashing y helpers de buffer. |
| `src/scene/generators/bufferTransforms.ts` | Ajuste determinista de recuento de puntos (`fitPointCount`). |
| `src/scene/generators/curves.ts` | Generación de puntos Lissajous con cross-mod, wavefold y ring modulation. |
| `src/scene/generators/grids.ts` | Generación de grids 2D y segmentos de rejilla 3D. |
| `src/scene/generators/stackEmbedding.ts` | Construcción del mapa de stack: clusters, anchors, labels y distribución de partículas. |

### 6.8. Shared UI, assets y utilidades

| Ruta | Función |
| --- | --- |
| `src/shared/components/PageTitle.tsx` | Componente de título reutilizable. |
| `src/shared/components/MicroLogo.tsx` | Logo navegable hacia home. |
| `src/shared/components/CustomCursor.tsx` | Cursor custom para dispositivos no táctiles. |
| `src/shared/components/InlineIcons.tsx` | SVGs inline de flechas y zoom. |
| `src/shared/assets.ts` | Imports ESM de assets de retrato. |
| `src/shared/utils/device.ts` | Detección de capabilities, reduced motion y tier del dispositivo. |
| `src/shared/utils/webgl.ts` | Detección superficial de soporte WebGL. |

### 6.9. Estado y tests

| Ruta | Función |
| --- | --- |
| `src/state/appStore.ts` | Store global Zustand con estado de shell, escena, interacción y navegación. |
| `tests/config/scenePresets.test.ts` | Tests de determinismo/escalado de presets. |
| `tests/scene/generators/curves.test.ts` | Tests de determinismo y finitud de curvas. |
| `tests/scene/generators/bufferTransforms.test.ts` | Tests de ajuste de buffers. |
| `tests/shared/utils/device.test.ts` | Tests de detección de device tier/capabilities. |

## 7. Decisiones técnicas detectables

### 7.1. React 19 con hooks modernos

Se detecta uso explícito de APIs nuevas de React 19:

- `useDeferredValue`
- `useEffectEvent`
- `React.lazy`
- `Suspense`

Esto indica una decisión consciente de trabajar con el stack React moderno y aprovechar defer/lazy en shell y routing.

### 7.2. SPA por rutas con escena persistente desacoplada

La arquitectura separa:

- navegación y contenido DOM por rutas
- sistema visual persistente fuera del ciclo de desmontaje de páginas

Es una decisión adecuada para una experiencia visual continua: las páginas cambian, pero el sistema de partículas se transforma en lugar de reiniciarse.

### 7.3. Estado global unificado con Zustand

Zustand se usa como único store compartido para:

- navegación visual
- puntero
- capacidades del dispositivo
- progreso por sección
- cámara y zoom del stack

No hay Context API personalizada ni Redux; el proyecto privilegia un store compacto y directo.

### 7.4. Motor de partículas propio basado en buffers

La escena no depende de un sistema de partículas externo. El proyecto implementa un motor propio con:

- `Float32Array`
- generación determinista de puntos
- blending entre targets
- modulación procedural
- interacción por puntero
- tween de explosión/hold

Esto es una decisión técnica importante: el núcleo visual está hecho a medida.

### 7.5. Three.js + React Three Fiber + Drei, sin postprocesado

La escena usa:

- `three`
- `@react-three/fiber`
- `@react-three/drei` solo de forma acotada (`Html`)

No hay rastro de `EffectComposer`, shaders dedicados en archivos GLSL, ni librerías de postprocesado; el look depende del material de puntos, glow por color y movimiento procedural.

### 7.6. GSAP para DOM y tweening de estados

GSAP se usa en varios lugares:

- entrada/reveal de páginas
- scroll animado del About
- transición de progreso del Stack

El proyecto no se apoya solo en CSS transitions; utiliza un motor temporal explícito para sincronizar interacciones y estados.

### 7.7. Estrategia explícita de adaptación por dispositivo

Se detectan varias decisiones de degradación y adaptación:

- `deviceTier` por ancho/capacidades
- reducción del `count` y `sizePx`
- `dpr` distinto por tier
- `reducedMotion` integrado en el motor de escena
- desactivación del cursor custom en touch
- fallback visual cuando no hay WebGL

### 7.8. CSS Modules + tokens globales

La UI combina:

- `index.css` para variables globales y tipografías
- `.module.css` por componente

Es una estrategia híbrida de estilos con encapsulación local y tokens visuales centrales.

### 7.9. Cobertura de test orientada a determinismo y configuración

Los tests existentes se concentran en piezas puras:

- presets
- curvas
- transforms de buffers
- utilidades de capacidades

No hay tests de UI, navegación, interacción o render de escena.

### 7.10. CI mínima pero suficiente

La pipeline de `.github/workflows/ci.yml` ejecuta en `push` y `pull_request` a `main`:

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run test`

## 8. Áreas de deuda técnica evidente

Las siguientes áreas aparecen como deuda técnica observable o como puntos de aclaración estructural. No implican necesariamente rotura actual, pero sí merecen revisión en auditoría.

### 8.1. Semántica de escalado inconsistente en presets de partículas

Hay dos convenciones distintas conviviendo en configuración:

- `createParticleTuning(...)` normaliza porcentajes y magnitudes a rangos de runtime
- `aboutMarginGridConfig`, `menuGridConfig` y `stackEmbeddingMapConfig` introducen valores crudos (`80`, `100`, `50`) que luego se copian a `ScenePreset`

Esto hace que propiedades como `opacity`, `glowBoost`, `driftMotion` u `orbitMotion` no sigan una semántica uniforme a nivel de configuración. El runtime actual clampa parte de estos valores, por lo que la app no falla, pero la intención del dato queda ambigua.

### 8.2. Unión `SceneMode` mezcla estados reales y presets auxiliares

`aboutFrame` y `contactDeltaOut` existen como miembros de `SceneMode` y como presets, pero no se detecta ningún flujo que los establezca como `sceneMode` activo. Se usan como presets auxiliares dentro de `useSceneSnapshot`, no como estados seleccionables del store.

Esto sugiere una frontera borrosa entre:

- modos reales de escena
- presets intermedios usados solo para blending

### 8.3. Documentación y artefactos históricos desalineados

El `README.md` describe carpetas `Documents` y `Visual-references`, pero el estado actual del repo no coincide:

- `Documents/` contiene solo `.DS_Store`
- `Visual-references/` está ignorada en `.gitignore` y no aparece en el worktree analizado

Además, el worktree tiene borrados pendientes en varios archivos de `Documents/`.

### 8.4. Configuración parcial bajo chequeo de TypeScript

`tsconfig.node.json` incluye `vite.config.ts`, pero no `vitest.config.ts`. Eso significa que el build por `tsc -b` no tipa esa configuración aunque sí exista en el repo y se use en tests.

### 8.5. Código y estructuras latentes

Se detectan elementos exportados o tipados que hoy no participan realmente en el flujo principal:

- `mapTransitionPointsToStack(...)` exportado pero sin referencias
- `ambientPoints` en `StackSceneData`, siempre vacío
- assets SVG en `Material/icon-*.svg`, mientras la UI usa iconos inline propios

Esto apunta a restos de iteraciones previas o extensión prevista no consolidada.

## 9. Inconsistencias y anomalías detectadas

### 9.1. Mismatch entre `engines` y `.nvmrc`

- `package.json` exige `node >=20.19.0`
- `.nvmrc` fija `25.8.1`
- CI usa `.nvmrc`

No es necesariamente incorrecto, pero sí refleja dos fuentes distintas de verdad para la versión de Node.

### 9.2. README desalineado con el estado actual del repo

El `README` sigue mencionando contenido documental y directorios auxiliares que no están presentes en el worktree en la forma descrita.

### 9.3. Worktree no limpio

Durante el análisis, `git status --short` mostraba borrados pendientes dentro de `Documents/`. Esto no afecta al runtime actual, pero sí condiciona la lectura del estado “completo” del repositorio porque parte de la documentación histórica no está consolidada.

### 9.4. Inconsistencias de copy/configuración de contenido

En `src/config/content.ts` se detectan pequeñas anomalías de contenido:

- `COPYWRIGHT` en lugar de `COPYRIGHT`
- label social `twitter / X` con casing mixto
- comillas de apertura/cierre no homogéneas en párrafos del About

No son problemas de arquitectura, pero sí inconsistencias de contenido embebido en código.

### 9.5. Assets locales no referenciados

Los archivos:

- `Material/icon-chevron-left.svg`
- `Material/icon-chevron-right.svg`
- `Material/icon-zoom-in.svg`
- `Material/icon-zoom-out.svg`

no aparecen referenciados en el código actual. La UI equivalente se resuelve con `src/shared/components/InlineIcons.tsx`.

## 10. Estado operativo observado

### 10.1. Comandos ejecutados

| Comando | Resultado |
| --- | --- |
| `npm run lint` | OK |
| `npm run build` | OK |
| `npm test` | OK |

### 10.2. Alcance real del testing

La suite valida correctamente:

- cálculo y escalado de presets
- determinismo de buffers
- determinismo de curvas
- detección de capacidades

No valida actualmente:

- navegación entre páginas
- accesibilidad
- animaciones GSAP
- render de escena WebGL
- sincronía DOM/escena

### 10.3. Estado de build

La build de producción completa sin errores y refleja una intención explícita de aislar el bloque pesado de WebGL en un chunk asíncrono grande pero controlado.

## 11. Puntos de partida recomendados para una auditoría posterior

Sin entrar todavía en juicio profundo, los ejes más prometedores para una auditoría técnica serían:

1. Semántica y consistencia de configuración en `curves.ts` + `scenePresets.ts`.
2. Frontera entre estados reales de escena y presets auxiliares.
3. Coherencia entre documentación viva (`README`) y artefactos presentes.
4. Alcance real de cobertura de tests frente a la complejidad interactiva del proyecto.
5. Limpieza de artefactos latentes y assets/documentos obsoletos.

## 12. Conclusión operativa

El proyecto actual es una SPA frontend creativa, centrada en experiencia visual, con una arquitectura de dos capas bien definida:

- navegación y contenido en React/Router
- motor visual persistente en R3F/Three.js alimentado por presets y buffers

La parte más singular del repositorio no está en las páginas, sino en el subsistema de escena: `useSceneSnapshot`, `ParticleField` y los generadores forman un motor visual propio suficientemente complejo como para merecer una auditoría específica separada de la capa DOM.
