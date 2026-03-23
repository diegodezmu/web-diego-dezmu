# DESCRIPCIÓN
Portffolio web responsive tipo web-shell con 5 páginas:
- Home
- About
- stack
- contact
- menu
El portfolio se caracteriza por un efecto "particle generator" que hace de hilo-conductor a lo largo de toda la web. Estos particles tienen un estado diferente por página y van cambiando de forma orgánica con los saltos paginación. 


# UI
## Color Palette
- dark: 010101
- dark-hover: 1F1F1F
- light-default: D1D1D1
- light-hover: FFFFFF
- light-off:3E3E3E

## Typography
**JetBrains Mono**
- title: regular, size 30, line height 140%
- body: light, size 17, line height 150%
- body-italic: light italic, size 17, line height 150%
- caption: regular, size 12, line height 140%
- button-menu-section: medium, size 30, line height 140%
- button-menu-section-hover: extrabold, size 38, line height 140%
- map: medium, size 15, line height 140%
## Responsive design
Los botones de paginación de la web situados en los extremos horizontales del viewport, serán los únicos elementos que cambien de forma en modo "mobile"; pasarán a estar en la parte superior central con las etiquetas de texto desactivadas y solo el ícono visible. 
*Revisar referencias visuales para mayor detalle*

## Botones
La página tiene 4 botones diferentes:
### button-pagination 
Los botones que cambian de una página a otra. 
- default-state: texto (light-off) + ícono (light default)
- hover-state: texto (light-hover) + ícono (light hover). En este estado el icono mediante una animación se desplaza 8px hacia el extremo pertinente.
**Este botón es el único que cambia en formato mobile. El label de texto desaparece y se usa sólo el ícono**
### button-menu-open
- default-state: solo visible la letra "M" con una línea fina de 0,5px (ambos en light default)
- hover-state: la palabra entera "menu" se despliega con una animación de derecha a izquierda (light hover)
### button-menu-close
- default-state: ícono (light default)
- hover-state: ícono (light hover)
### button-menu-section
- default-state: texto (color light-default + type button-menu-section)
- hover-state: texto (color light-hover + type button-menu-section-hover). En este estado el resto de botones de la lista (fuera del hover) pasan a color light-off.
### button-contact-mail
-  default-state: fondo dark + texto y stroke light-default
- hover-state: fondo dark-hover + texto y stroke light-hover

## Cursor
El cursor del ratón está personalizado en formato vectorial SVG. Tiene dos estados:
- default-state: estado por defecto en toda la web
- hover-state: estado activo cuando el cursor hace hover sobre los cuatro tipos de "buttons" interactivos. Este estado es el mismo vector pero con: "+5%" de tamaño, y una rotación hacia la derecha de 180º. 
  (El cursor cambia de estado con una animación ligera al hacer hover sobre las zonas de interacción).

## Líneas
Las líneas verticales finas a la izquierda de los "titles" son un recurso gráfico que se repite. Están siempre en color "light-default" y tienen un grosor de 0,5px.

## Imagen
El portrait de la página "about" es la única fotografía de la web. Está optimizada para web en formato "webP".

## Gradient
En la página "about" hay un **linear gradient** que ocupa el 30% inferior del "viewport". Este efecto difumina ligeramente el contenido que entra por el "viewport".
Color del gradiente: 
- Stop inferior: dark
- Stop superior: dark 0% (transparente)

## Logo
El logo del portfolio es un texto vectorial con la etiqueta "DIEGO DEZMU". Tiene dos estados:
- A) display - activo en la home (colocado centrado en tamaño grande).
- B) micro - activo en el resto de páginas menos en el menú (colocado en la parte superior izquierda en tamaño reducido).

## stack labels
En la página de stack hay un mapa tridimensional donde se encuentran todos los "stack-labels" esparcidos por todo el mapa. 

# ANIMACIÓN

## Particles
La web tiene una animación que funciona como hilo-conductor durante todo el user journey. Se trata de un efecto tipo “particles” con distintas instancias que cambian en cada sección de la web.

- Instancia 1: activa en página “home”. Aquí la función "partikles" actúa sobre el logo vectorial del portfolio (ver logo.svg). Su estado es “estático”. 

- Instancia 2: activa en página “about”. Aquí la función "partikles" actúa sobre una forma generada por el sintetizador de curvas de lissajours interno (ver curva-alpha). Esta curva va mutando de forma de forma animada. Su estado es “dinámico”

- Instancia 3: activa en página “about” al final del scroll-down. Aquí la función "partikles" pasa a actuar sobre un espacio rectangular en los extremos del viewport (ver reference-partikles-frame.jpg). Su estado es “estático”.

- Instancia 4: activa en página “stack”. Aquí la función "partikles" se convierte en una nebulosa de clusters granulados (ver reference-partikles-nebula.jpg). Su estado es “estático”

- Instancia 5: activa en página “contact”. Aquí la función "partikles" actúa sobre una forma generada por el sintetizador de curvas de lissajours interno (ver curva-beta). Esta curva va mutando de forma de forma animada. Su estado es “dinámico”

- Instancia 6: activa en página “menú”. Aquí la función "partikles" llena todo el espacio del viewport (ver reference-partikles-fullscreen.jpg). Su estado es “estático”.

**Todas las instancias son reactivas al paso del cursor**

### Curvas de lissajours 
- Curva Alpha (instancia 2)
  Parámetros: Mirar archivo "CURVES-CONFIG.MD" en repositorio
- Curva Beta (instancia 5)
  Parámetros: Mirar archivo "CURVES-CONFIG.MD" en repositorio

# USO REFERENCIAS VISUALES
- reference-partikles-frame.jpg:
  Esta imagen es una representación del espacio del viewport que acogerá a los "partikles" en la instancia 3 (scrolled-down about). **Tomar como inspiración para la creación de la instancia** 3
- reference-partikle-nebula.jpg:
  Esta imagen representa una nebulosa tridimensional con forma general de banda alargada horizontal, irregular y asimétrica, como un río de polvo estelar suspendido en el vacío. El volumen principal no es compacto: presenta zonas de mayor y menor densidad. **Tomar como inspiración para la creación del "stack-map-3D".
- reference-partikles-fullscreen.jpg:
  Esta imagen es una representación del espacio del viewport que acogerá a los "partikles" en la instancia 6 (menu). **Tomar como inspiración para la creación de la instancia 6**
- UI-screens (home, about 1, about 2, stack, contact, menu, button states, mobile).
  Diseño de las pantallas del portfolio para web y mobile . **Usar como referencia de diseño con la mayor exactitud posible y adaptando los componentes a formato responsive. Usar múltiplos de "2px" en espaciados y tamaños de forma consistente.**





  

# USER JOURNEY
### home
La página por defecto. El logo (logo-macro.svg) de partículas reina el centro de la página. Aquí no hay scroll, pero el usuario puede interactuar con el cursor en la zona de "partikles" con repulsion (instancia 1). Debajo del logo está el text-role title (type "title" + color "light-default") con una . En el extremo derecho se encuentra el "button-pagination" de "about >" con el texto (type "title" + color "light-off") y el ícono (light-default). En la parte superior derecha está el ### button-menu-section contraído (menu.svg).
### about
La segunda página. Aquí el logo pasa a su estado "micro" sin partikles (logo-micro.svg). En el centro de la página está la curva "alpha" en movimiento (instancia 2), y sobre ella (una capa por encima), sobresale el inicio del "div" de contenido con text-title-about y foto.
Cuando el usuario hace scroll-down, el div de contenido sube para arriba mostrando el contenido oculto (bloques de texto con bio del portfolio), y efecto de "partikles" pasa a los extremos del viewport (instancia 3). Cuando el usuario recupera el scroll a su punto de inicio, los "partikles" vuelven a la instancia 2. En los extremos laterales están los "button-pagination" con dos direcciones posibles: izquierda = home, derecha = stack. 
En la parte superior derecha de nuevo está el ### button-menu-section contraído (menu.svg).
### stack
Esta página tiene un tipo de interacción diferente ya que permite navegar un "partikle skill-map" en perspectiva 3D (instancia 4). Aquí el scroll nos permite hacer zoom in/out, y el click+arrastre nos permite mover la vista cámara en perspectiva 3D hacia todas las direcciones. 
**La idea es crear un "stack-map-3D" tipo red neuronal con los skills del portfolio representados con distintos cúmulos de partículas de diferentes densidades . El objetivo es emular una nube volumétrica de "partikles", distribuida de forma no uniforme. La densidad aumenta en el eje central de la nebulosa y disminuye hacia los bordes. La silueta debe ser porosa, con vacíos internos y zonas donde el volumen se rompe o se adelgaza. Dentro de este mapa hay 4 zonas diferenciadas: 
- AI skills
- Design skills
- Development skills
- Sound skills 
Cada zona tiene un volumen porcentual a la cantidad de skills (ver stack list en archivo "COPYS.md" del repositorio). 
Debajo de cada uno de estos cúmulos disciplinares se encuentran los "labels" de cada skill.
El la parte superior central de la página se encuentra el text-title de "stack". En los extremos tenemos los "button-pagination" de "about" a la izquierda y "contact" a la derecha.
En la parte superior derecha de nuevo está el button-menu-section contraído (menu.svg) y en la izquierda el logo-micro.
### contact
La última página del portfolio. Sólo tiene un "button-pagination" de paginación a la izquierda para volver a "stack". En el centro se dispone la curva de "partikles" Beta creando formas animadas. Por encima de la capa de "partikles" está el div de contacto con el "button-contact-mail", y un text-title de contacto (type "title" + color "light-default"). Debajo hay un caption de copywright centrado (type "caption" + color "light-off").
En la parte superior derecha de nuevo está el button-menu-section contraído (menu.svg) y en la izquierda el logo-micro.
### menu
El menú está disponible desde todas la páginas mediante el "button-menu-open" para desplegar, y "button-menu-close" para cerrar. En esta página las "partikles" pasan a llenar todo el espacio del viewport (instancia 6), por encima en una capa superior se encuentran los botones "button-menu-section" que conectan con las diferentes páginas de la web.
# SCHEMAS
## User journey schema
Utilizar esquema del user journey como contexto visual de apoyo en la creación del UX/UI
## Animation instances schema
Utilizar esquema como contexto visual de apoyo en la realización de las instancias de "partikles"

# MATERIAL PROPORCIONADO
- Pantallas UI web (jpg)
- Pantallas UI mobile (jpg)
- Botones y estados (jpg)
- Imágenes de referencia (jpg)
- Portrait (jpg)
- Cursor vector (svg)
- Logo display + micro vectors (svg)
- Menu vector (svg)
- PRD (markdown)
- Schemas (jpg)
- Copys (markdown)


# STACK
Para realizar el proyecto Codex deberá hacer uso de sus skills:
- Skill fusion: para combinación de skills.
- Lissajous synth: para creación de curvas y partikles.
- Creative web architect: para plantear la estructura del proyecto y definir el roadmap de ejecución.
- Frontend motion implementer: para ejecutar el plan de desarrollo.
# IMPORTANTE
- El portfolio está diseñado para verse bien en formato web, aunque finalmente sea responsive y haya versión mobile, es importante primero dejar bien la versión web y después adaptar a formatos más pequeños. 
- La navegación e interacción ha de ser fluida y sin saltos. Dado que hay funcionalidades con efectos interactivos sobre la UI, habrá que plantear bien las capas de la web y hacer uso de prácticas profesionales para desarrollo de webGL.


