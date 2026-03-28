# Backlog post-auditoría — `web-diego-dezmu`

> Consolidación de todos los hallazgos, notas y acciones futuras generados durante la auditoría técnica del repositorio.
> Branch de auditoría: `audit/main`. Commits: desde fase 1 hasta fase 10.

---

## Prioridad 1 — Performance DOM/GSAP en home y contact [RESUELTO]

**Síntoma:** al cargar `/`, el efecto de partículas se congela brevemente (~38 fps, ~24 dropped frames). Es el único punto de la web donde la carga no se siente sólida. En `/contact` hay una degradación menor (~57 fps, ~4 dropped frames).

**Diagnóstico:** la fase 6 de auditoría (commit `e002a14`) descartó el hot path WebGL como causa. El congelamiento coincide con el mount de `HomePage.tsx`, donde GSAP anima el wordmark y los roles vía `useLayoutEffect` + `gsap.fromTo()`. La hipótesis es que esas animaciones provocan layout thrashing en el hilo principal, bloqueando el `useFrame` de R3F durante esos milisegundos. Misma lógica aplica a `/contact`, donde el reveal progresivo del email y sociales también usa GSAP con wheel/touch.

**Validación rápida:** comentar temporalmente el `useLayoutEffect` de GSAP en `HomePage.tsx`. Si las partículas cargan fluidas desde el primer frame, la causa queda confirmada.

**Líneas de fix probables:**
- Añadir `will-change: transform, opacity` en el CSS de los elementos animados del hero (wordmark, roles)
- Verificar que GSAP solo anime propiedades que no provocan layout (transform, opacity) — nunca width, height, top, margin ni similares
- Revisar si el timeline GSAP se recrea en cada mount en vez de reutilizarse
- Considerar un `requestAnimationFrame` de delay antes de arrancar la animación GSAP, para que el canvas tenga uno o dos frames limpios antes de competir por el hilo

**Alcance:** fase dedicada de performance DOM/GSAP.

### ✅ Resuelto — commits `97b08ac` y `82c8823`

| Ruta | FPS antes | FPS después | Dropped frames antes | Dropped frames después |
|------|-----------|-------------|---------------------|----------------------|
| `/` | ~38 | ~116 | 24 | 4 |
| `/contact` | ~57 | ~116 | 4 | 2 |

Causa raíz: el ticker JavaScript interno de GSAP competía con el render loop de R3F por el hilo principal durante los 3 segundos de animación de mount. Solución: reemplazo de animaciones GSAP de mount por CSS `@keyframes` puro, que se ejecuta en el compositor del navegador sin tocar el hilo principal.

Criterio para futuro: si una animación cabe en un `@keyframes` sin perder control dinámico, debe ser CSS. GSAP solo se justifica cuando se necesita control programático, timelines complejos, scrub o sincronización con estado de React.

---

## Prioridad 2 — Visibilidad del foco con cursor custom

**Síntoma:** si `CustomCursor.tsx` aplica `cursor: none` globalmente vía CSS, el cursor nativo del sistema queda oculto. Un usuario de teclado pierde el indicador visual de dónde está el foco si los elementos interactivos no tienen un `outline` o `focus-visible` explícito.

**Validación rápida:** navegar la app completa con Tab sin tocar el mouse. Si en algún punto no se ve dónde está el foco (ningún borde, highlight o cambio visual), falta un estilo de `focus-visible`.

**Fix probable:** añadir una regla global tipo `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` en `index.css`, que solo aparece cuando se navega con teclado y no interfiere con la experiencia de mouse/cursor custom.

**Alcance:** fix puntual en `index.css`, se puede hacer como commit aislado.

---

## Prioridad 3 — Tokenización de valores CSS hardcoded

**Síntoma:** los breakpoints están consolidados (`1200px` y `767px`), pero persisten colores y valores de spacing hardcoded repetidos en CSS Modules individuales que deberían ser custom properties globales en `index.css`.

**Acción:** abrir una fase dedicada donde se inventaríen los valores repetidos en los CSS Modules, se promuevan a tokens globales y se reemplacen en los módulos. No se hizo durante la auditoría para no mezclar limpieza con rediseño del sistema de tokens.

**Alcance:** fase dedicada de tokenización CSS.

---

## Prioridad 4 — Focus reset global tras cambio de ruta

**Síntoma:** al navegar entre secciones vía `react-router-dom`, el foco del teclado no se mueve al contenido nuevo — queda donde estaba o se pierde. El fix del menú overlay (commit `8b9df8f`) resolvió el caso puntual del dismiss, pero la política global de foco post-navegación sigue pendiente.

**Analogía:** es como cambiar la página de un libro pero que tu dedo siga marcando la línea de la página anterior. El contenido cambió, tu posición no.

**Fix probable:** implementar un hook tipo `useRouteChangeFocus` que mueva el foco al contenedor principal o al `PageTitle` de la nueva sección en cada cambio de ruta.

**Alcance:** fase propia, porque afecta el comportamiento global de la app y necesita verificación en todas las rutas.

---

## Prioridad 5 — Auditoría de accesibilidad con tooling

**Estado actual:** la verificación de accesibilidad en fases 8-9 se hizo manualmente con teclado y Playwright. No se ejecutó axe-core ni Lighthouse porque no hay tooling local instalado y la fase no justificaba añadir dependencias.

**Acción:** cuando se abra un pase de accesibilidad profundo, correr axe-core desde DevTools del navegador (no requiere instalación en el proyecto) o integrar `@axe-core/playwright` como devDependency para automatizarlo.

**Alcance:** parte de un pase de accesibilidad mayor que incluya los puntos 2 y 4 de este backlog.

---

## Prioridad 6 — Links placeholder en contact

**Síntoma:** `contactSocialLinks` declara placeholders sin `href`, por lo que la UI de redes mezcla links reales y texto pasivo. La auditoría propuso tres opciones: llenar con URLs reales, ocultar hasta tener destino, o renderizar como `<span>` en vez de `<a>`.

**Acción:** decidir qué redes sociales van a tener presencia real y rellenar los `href`. Para las que no tengan destino, renderizar como texto no-interactivo o eliminar del array.

**Alcance:** decisión de producto, no técnica. Se puede resolver en un commit aislado una vez tomada la decisión.

---

## Notas de contexto

- Todas las prioridades son independientes entre sí. Se pueden abordar en cualquier orden, aunque el orden propuesto refleja impacto percibido por el usuario.
- Las prioridades 2, 4 y 5 podrían agruparse en una sola fase de "accesibilidad completa" si se prefiere abordarlas juntas.
- La prioridad 1 (performance GSAP) es la única que un visitante percibe como problema hoy. El resto son mejoras de calidad interna o de accesibilidad.
