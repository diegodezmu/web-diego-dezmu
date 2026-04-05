# CHANGELOG FASE 4D

## Correcciones aplicadas

### 1. Títulos interactivos con semántica de heading accesible
- **Archivos:** `src/shared/components/PageTitle.tsx`, `src/features/pages/AboutPage.tsx`, `src/features/pages/ContactPage.tsx`, `src/features/pages/StackPage.tsx`
- **Corrección:** Los `PageTitle` renderizados como `span` dentro de botones ahora exponen `role="heading"` y `aria-level={1}` en las vistas `About`, `Contact` y `Stack`.
- **Motivo:** Mantener un encabezado principal identificable por tecnologías de asistencia aunque el título visual esté integrado en un control custom.
- **WCAG 2.1 AA:** `1.3.1 Info and Relationships`, `2.4.6 Headings and Labels`

### 2. Estado ARIA en controles custom de About, Contact y Stack
- **Archivos:** `src/features/pages/AboutPage.tsx`, `src/features/pages/ContactPage.tsx`, `src/features/pages/StackPage.tsx`
- **Corrección:** Se añadieron `aria-controls`, `aria-pressed` y `aria-expanded` según el patrón de interacción de cada botón principal.
- **Motivo:** Comunicar de forma programática el estado de toggles y contenido controlado en componentes custom.
- **WCAG 2.1 AA:** `4.1.2 Name, Role, Value`

### 3. Acceso por teclado al contenedor scrollable de About
- **Archivo:** `src/features/pages/AboutPage.tsx`
- **Corrección:** El área scrollable ahora tiene `tabIndex={0}` y `aria-labelledby`, de modo que puede recibir foco y desplazarse con teclado.
- **Motivo:** El contenido textual de About dependía del scroll interno y no tenía un destino claro en la secuencia de tabulación.
- **WCAG 2.1 AA:** `2.1.1 Keyboard`, `2.4.3 Focus Order`

### 4. Enlaces de Contact fuera del tab order cuando están ocultos visualmente
- **Archivo:** `src/features/pages/ContactPage.tsx`
- **Corrección:** El email y los enlaces sociales pasan a `tabIndex={-1}` mientras el bloque está colapsado; al revelarse recuperan su comportamiento normal.
- **Motivo:** Evitar foco invisible en elementos presentes en DOM pero no perceptibles visualmente al inicio.
- **WCAG 2.1 AA:** `2.4.3 Focus Order`, `2.4.7 Focus Visible`

### 5. Agrupación y etiquetado de enlaces sociales
- **Archivo:** `src/features/pages/ContactPage.tsx`
- **Corrección:** El contenedor de enlaces sociales ahora usa `role="group"` y los enlaces externos anuncian que abren una nueva pestaña mediante `aria-label`.
- **Motivo:** Mejorar la comprensión del grupo y reducir ambigüedad en navegación asistida.
- **WCAG 2.1 AA:** `2.4.4 Link Purpose (In Context)`, `4.1.2 Name, Role, Value`

### 6. Nombre accesible del diálogo de menú y estado de página actual
- **Archivo:** `src/features/menu/MenuOverlay.tsx`
- **Corrección:** El overlay añade `aria-label="Site menu"` al `dialog`, marca la vista activa con `aria-current="page"` y oculta líneas decorativas del botón de cierre con `aria-hidden="true"`.
- **Motivo:** El diálogo necesitaba nombre accesible y la navegación debía exponer la ubicación actual.
- **WCAG 2.1 AA:** `1.3.1 Info and Relationships`, `2.4.4 Link Purpose (In Context)`, `4.1.2 Name, Role, Value`

### 7. Elementos puramente decorativos ocultos al árbol de accesibilidad
- **Archivos:** `src/features/pages/StackPage.tsx`, `src/shared/components/CustomCursor.tsx`
- **Corrección:** Se añadió `aria-hidden="true"` al hint gestual y a la capa de interacción gestual de Stack, y `aria-hidden="true"`/`focusable="false"` a los SVG decorativos del cursor custom.
- **Motivo:** Evitar ruido para lectores de pantalla en elementos visuales sin valor semántico.
- **WCAG 2.1 AA:** `1.1.1 Non-text Content`, `4.1.2 Name, Role, Value`

## Verificaciones sin cambio de código

### 8. Imágenes
- **Resultado:** `portrait-desktop.webp` ya tenía `alt` descriptivo y la imagen fallback decorativa ya usaba `alt=""`.
- **WCAG 2.1 AA:** `1.1.1 Non-text Content`

### 9. Canvas R3F
- **Resultado:** El `Canvas` de `@react-three/fiber` y su contenedor ya estaban marcados con `aria-hidden="true"`.
- **WCAG 2.1 AA:** `1.1.1 Non-text Content`

### 10. Focus visible y reduced motion
- **Resultado:** Ya existían estilos globales `:focus-visible` y cobertura amplia de `prefers-reduced-motion` en páginas, navegación, menú, logo y escena 3D.
- **WCAG 2.1 AA:** `2.4.7 Focus Visible`, `2.2.2 Pause, Stop, Hide`, `2.3.3 Animation from Interactions`

## Pendiente detectado sin cambio en esta fase

### 11. Intro curtain sin rama específica de reduced motion
- **Archivos:** `src/app/IntroCurtain.tsx`, `src/app/IntroCurtain.module.css`
- **Observación:** La cortinilla de entrada mantiene su secuencia animada sin una adaptación específica para `prefers-reduced-motion`.
- **Motivo de no corrección en Fase 4D:** La instrucción de esta fase limitaba los cambios a atributos en componentes React, sin tocar estilos ni lógica.
- **WCAG 2.1 AA relacionado:** `2.2.2 Pause, Stop, Hide`, `2.3.3 Animation from Interactions`
