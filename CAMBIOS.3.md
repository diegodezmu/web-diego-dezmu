# UI Web + Mobile
Se ha formalizado el diseño final de pantallas tanto para web como para mobile en Figma. Hay que ajustar todas las pantallas e integrar toda la información de diseño en el código. 
Incluyendo:
- Formato, límites y espaciado de elementos en pantallas.
- Estilos de texto renovados.
- Estilos de color renovados.
- Components y variants con los diferentes estados de botones.
- Imágenes de portrait renovadas (coger de la carpeta "material" del repo).
- Cursor nuevo. Cambiar por nueva versión (coger de la carpeta "material" del repo).

**Utilizar los MCP de Figma para entrar al proyecto y exportar toda la información detallada**
Enlace a página de Figma: https://www.figma.com/design/uLdnRDaa6RcUEyL0JcORrb/Portfolio---v2?node-id=174-837

# Pantallas nuevas
- **La pantalla stack pasa a tener dos estados con dos instancias de "partikles" diferentes.
	- stack1-default: title en el centro y una nueva curva de partículas (gamma) alrededor (instancia 4). En la parte inferior se atisban los "stack-labels" bajo el overlay.
	- stack2-scrolled: el scroll activa el cambio a instancia 5: "gamma" se convierte en nebulosa y los "stack-labels" se reorganizan de forma aleatoria dentro de la nube de partículas. El conjunto ahora rota muy lentamente. (parámetros de instancia más abajo)

- La pantalla contact también pasa a tener dos estados con dos instancias de "partikles" diferentes.
	- contact1-default: title en el centro y una nueva curva de partículas (delta) alrededor (instancia 6).
	- contact2-hover: el scroll activa el cambio a instancia 7: "delta" move out por la parte superior con ease suave y dejando un halo a su paso.

# Efecto "partikles" 
Se introduce una nueva secuencia de instancias: 
## Instancia 1
- Ubicación: home
- Forma: curva sintetizada "alfa"
- Estado: dinámico
- Posición: centrado 
- Profundidad: sub-UI elements. 
- Max width: 30% viewport
-  Move in: salida desde abajo del viewport con easing suave. La aparición tiene que dejas un "halo" de partículas a su paso.
- Parámetros: ()
## Instancia 2
- Ubicación: about
- Forma: curva  sintetizada "beta"
- Estado: dinámico
- Posición: centrado 
- Profundidad: sub-UI elements. 
- Max width: 30% viewport
- Parámetros: ()
## Instancia 3
- Ubicación: about 
- Forma: marco rectangular - "partikles" forman un grid ordenado de puntos de 16x16px
- Estado: 100 % estático (0% motion)
- Posición: márgenes del viewport (72px-desktop / 40px-mobile)
- Profundidad: sub-UI elements pero por encima de overlay.
- Max width: 100% viewport
- Move in: transición tras scroll down.
- Parámetros: ()
## Instancia 4
- Ubicación: stack1-default
- Forma: curva sintetizada "gamma"
- Estado: dinámico
- Posición: centrada
- Profundidad: sub-UI elements pero por encima de overlay.
- Max width: 30% viewport
- Move in: transición tras scroll down.
- Parámetros: ()
## Instancia 5
- Ubicación: stack2-scrolled
- Forma: nebulosa ()
- Estado: semi-estático (rotación ligera)
- Posición: centrada
- Profundidad: sub-UI elements pero por encima de overlay
- Max width: 50% viewport
- Move in: transición tras scroll down
- Navegación: **se elimina "zoom" y se mantiene el "3D-drag".
- Parámetros: ()
## Instancia 6
- Ubicación: contact
- Forma: curva sintetizada "delta"
- Estado: dinámico
- Posición: centrada
- Profundidad: sub-UI elements
- Max width: 30% viewport
- Parámetros: ()
## Instancia 6-out
- Ubicación: contact
- Forma: "delta" move out tras scroll down 
- Estado: dinámico
- Profundidad: sub-UI elements
- Parámetros: ()
## Instancia 7
- Ubicación: menu
- Forma: full-screen - "partikles" forman un grid ordenado de puntos de 24x24 px 
- Estado: 100% estático (0% motion)
- Posición: full screen
- Profundidad: sub-UI elements
- Max width: 100% viewport
- Parámetros: ()

- **Importante ajustar la transición entre instancias para que las partículas cambien de estado de forma suave y orgánica**
- **Se añade nuevo efecto "glow": "partikles" suben opacidad al 100% al entrar en contacto con el "pointer radius" del cursor. 
# Animación

### button-menu-default
La primera vez que se carga la web, el botón de menu contraído (M), hace move in desde el extremo derecho del viewport hacia dentro con un easing suave + escalado de opacidad (0%-100%). El mismo efecto pero a la inversa ocurre cuando se abre la página de menu.
### button-menu-hover
Texto "MENU" con reveal por caracteres** — Las letras aparecen y desaparecen con un stagger (una detrás de otra), como fichas de dominó cayendo en secuencia. Cuando se abre el menú, las letras salen deslizándose hacia la derecha y desvaneciéndose; al cerrar, vuelven a entrar por el mismo camino.
### button-menu-close
**Morphing del icono + → × → +** — El icono en forma de cruz (`+`) rota 45° para convertirse en una `×` (cerrar) al abrir el menú, y vuelve a girar -45° para cerrar. La transición tiene un escalado de opacidad (0%-100%) y es suave y eased, como una puerta giratoria que frena al llegar a su posición.
### Cursor
La animación del cursor también se actualiza: rotación de 90° al hacer hover en botones pulsables.

### Titles 
Los bloques de texto titulares: logo-display, AI BUILDER & PRODUCT DESIGNER, ABOUT, STACK Y CONTACT; han de entrar en pantalla animados con:
-  escalado de opacidad (0%-100%) 
-  move in desde el final del primer tercio del viewport

### buttons-menu 
Los botones del menu (HOME, ABOUT, STACK y CONTACT) y el caption de copywright entran con escalado de opacidad (0%-100%)