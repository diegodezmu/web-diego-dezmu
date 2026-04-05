# CHANGELOG-FASE3B

## Estado del fallback WebGL

### Qué había

- `src/shared/utils/webgl.ts` no hacía un check real de WebGL.
- El código anterior devolvía `true` si existían `window.WebGL2RenderingContext` o `window.WebGLRenderingContext`.
- Eso no garantizaba que el navegador pudiera crear un contexto WebGL real en tiempo de ejecución.
- En `src/app/AppShell.tsx`, cuando `webglSupported === false`, la web mostraba un fallback visual basado en gradientes CSS (`fallbackBackdrop--*`) y mantenía la capa de contenido activa.
- El contenido principal, navegación, header y páginas seguían renderizándose sin dependencia directa del canvas.

### Qué se cambió

- `src/shared/utils/webgl.ts` ahora crea un `canvas` temporal e intenta obtener `webgl2`, `webgl` o `experimental-webgl`.
- Si no obtiene contexto, devuelve `false`.
- Si obtiene contexto, lo libera mediante `WEBGL_lose_context` cuando la extensión está disponible.
- `src/app/FallbackBackground.tsx` y `src/app/FallbackBackground.module.css` sustituyen el fondo CSS plano por un fallback estático con `<picture>` y `srcSet`.
- `src/app/AppShell.tsx` mantiene intacta la estrategia de carga del `SceneCanvas`. No se ha cambiado el `lazy`, no se ha diferido el montaje y no se ha tocado la cortina de intro.
- El fallback visual sigue usando las capas/tintes por escena que ya existían, pero ahora sobre una imagen estática del estado base de partículas.

### Valoración

- Antes: funcional, pero poco pulido visualmente y con detección de soporte insuficiente.
- Ahora: el fallback es profesional, consistente con la dirección visual del sitio y mantiene la web plenamente usable sin WebGL.

### Verificación

- Escenario forzado sin WebGL: `canvas` ausente, fallback estático presente, botón de menú y contenido home visibles.
- Escenario forzado con crash después del check inicial: `canvas` ausente, fallback estático presente, contenido y navegación siguen operativos.

## Estado del sistema de tiers

### Umbrales actuales

- `mobile`: `width <= 767`
- `tablet`: `768 <= width <= 1200`
- `desktop`: `width > 1200`
- `lowPower`: `deviceMemory <= 4` o `hardwareConcurrency <= 4` o `prefers-reduced-motion: reduce`

### Ajuste importante aplicado

- La implementación anterior marcaba cualquier `width <= 767` como `lowPower`.
- Resultado: el tier `mobile` existía en tipos y presets, pero en la práctica nunca se alcanzaba.
- Se corrigió `src/shared/utils/device.ts` para que `mobile` y `lowPower` sean categorías distintas, como pedía el sistema original.

### Factores de escala

- `count`
  - `desktop = 1`
  - `tablet = 0.84`
  - `mobile = 0.72`
  - `lowPower = 0.6`
- `sizePx`
  - `desktop = 1`
  - `tablet = 0.94`
  - `mobile = 0.9`
  - `lowPower = 0.88`
- Mínimo de partículas: `1800`

### DPR del canvas

- `desktop`: `[1, 1.85]`
- `tablet`: `[1, 1.45]`
- `mobile`: `[1, 1.2]`
- `lowPower`: `[1, 1.05]`
- `gl.powerPreference`: `'high-performance'`

### Valoración

- El sistema ya era bueno en escalado progresivo de densidad y resolución.
- El único problema estructural era que `mobile` no era alcanzable.
- Tras la corrección, el sistema de tiers queda coherente y utilizable tal como está.
- El mínimo de `1800` partículas sigue siendo razonable para no degradar en exceso la lectura visual de la escena.

## Estado del ErrorBoundary

### Qué había

- No existía `ErrorBoundary` alrededor del `Canvas` de R3F.

### Qué se cambió

- Se creó `src/app/SceneErrorBoundary.tsx`.
- `src/app/AppShell.tsx` envuelve `Suspense + SceneCanvas` con este boundary.
- Cuando R3F falla, el boundary muestra el mismo fallback estático del escenario sin WebGL.

### Resultado

- Un crash de WebGL/R3F ya no tumba la web completa.
- Verificado forzando un error tras pasar el check inicial de soporte.

## Hallazgos de responsive

### 375x812

- `Home`: sin desbordes críticos detectados.
- `About`: el contenido adicional cae por debajo del fold, pero es intencional porque la página es scrollable.
- `Stack`: sin solapes o desbordes críticos detectados.
- `Contact`: el bloque de enlaces revelado quedaba demasiado bajo en viewport pequeño. Se corrigió elevando y ensanchando `linksBlock`, permitiendo además wrap en la fila social.

### 768x1024

- `Home`: sin incidencias críticas.
- `About`: el contenido largo bajo el fold sigue siendo intencional por scroll.
- `Stack`: sin incidencias críticas.
- `Contact`: el mismo problema del bloque revelado quedaba ajustado al borde inferior. Corregido con el mismo ajuste responsive.

### 1024x768

- Sin desbordes ni solapes críticos detectados en `Home`, `About`, `Stack` y `Contact`.

### 1440x900

- Sin desbordes ni solapes críticos detectados en `Home`, `About`, `Stack` y `Contact`.

## Hallazgos de accesibilidad básica

### Navegación por teclado

- No se detectaron `onClick` relevantes montados sobre elementos no semánticos.
- Los elementos interactivos principales usan `button`, `a` o `Link`.
- Se añadió activación por `click` semántico a los títulos interactivos de `About` y `Stack`, manteniendo su comportamiento pointer/touch existente.
- Verificado:
  - `About`: el botón del título ya puede disparar el scroll/toggle.
  - `Stack`: el botón del título ya puede abrir la transición al mapa.
  - `Menu`: apertura funcional y cierre por `Escape` funcional.

### Canvas decorativo

- `src/scene/SceneCanvas.tsx` ya ocultaba el wrapper con `aria-hidden="true"`.
- Se añadió también `aria-hidden="true"` al `Canvas`.

### Reduced motion

- Ya existía detección en `src/shared/utils/device.ts`.
- Ahora `AppShell` además re-sincroniza capacidades cuando cambia `prefers-reduced-motion`.
- La escena R3F ya reducía órbitas, drift y modulación LFO.
- Se añadió simplificación/desactivación de motion DOM en:
  - `HomePage`
  - `AboutPage`
  - `ContactPage`
  - `StackPage`
  - `useStackTransition`
  - `MenuOverlay`
  - `PaginationControls`
  - `MicroLogo`
  - `MenuToggle`
- Verificado:
  - `Home`: `animation-name: none`
  - `Stack`: transición a mapa inmediata y `transition-duration: 0s` en la UI auditada

## Screenshots generados

- `375x812`
  - `src/assets/images/fallback/home-alpha-375x812.webp`
- `768x1024`
  - `src/assets/images/fallback/home-alpha-768x1024.webp`
- `1440x900`
  - `src/assets/images/fallback/home-alpha-1440x900.webp`
- `1920x1080`
  - `src/assets/images/fallback/home-alpha-1920x1080.webp`

## Resumen final

- Fallback WebGL: verificado y mejorado.
- Sistema de tiers: verificado; se corrigió la imposibilidad práctica del tier `mobile`.
- ErrorBoundary: creado y validado.
- Responsive: sin problemas críticos generales; corregido el caso real de `Contact`.
- Accesibilidad básica: reforzada en teclado, reduced motion y canvas decorativo.
