
## UI
- **Se han actualizado estilos de color y tipografía en diseños de Figma. Revisar FIGMA-LINKS.3 y ajustar.**
- Estilos de texto: menu-buttons, logo-display, logo-micro y H1 suben el espacio entre letras al 50% para que queden más amplios los títulos (tanto en web como en mobile).
## Referencias visuales
- Se ha añadido carpeta de "VISUAL-REFERENCES" al repo. Analizar para ver: margin, overlay, text-start-position, instancias 3 y 7.
## Cursor
- Actualizar con nueva versión en repo "cursor.png". 
- Añadir animación +50% tamaño al hacer hover en botones interactivos.
## Portrait
Se han cambiado los portrait (web y mobile). Actualizar desde la carpeta de Material del repo
## Titles 
Títulos: Diego Dezmu (logo display), AI Builder, Product Designer, About, Stack y Contact
 - Aumentar tiempo de fade-in de entrada 
 - Bajar el starting point del fade-in al 15% del viewport height. 
 - Añadir sombra color "dark" para que resalten bien sobre los "partikles"
 - La línea separadora vertical de la izquierda de los titles (about, stack y contact) desaparece. Hay que eliminarla.
## Buttons-pagination
- Se ha actualizado el diseño del componente en sus dos estados (ver link de componentes de Figma y ajustar).
- El ícono de flecha del botón ha de quedar alineado con el inicio del margen sin rebosarlo.
- Crear "eased animation" de overlay (0-100%) para entrada y salida de buttons-pagination en pantalla.
## Efecto Partikles e Instancias
- Esta capa ha de estar siempre por encima del overlay para evitar que quede oculta. 
- Hacer las transiciones de estado entre instancias un poco más rápidas.
- Las Instancias de scroll (about2 y contact2) se activan al toque (scroll>1% = trigger instancia)
- Se han actualizado los valores de partículas en todas las instancias. Revisar CURVE-CONFIG-3.2.md y actualizar
## Overlay
- Se reduce la altura del overlay en el viewport. Revisar link de referencias del FIGMA-LINK-3.
## Button-menu-open (M)
- Se ha reducido el tamaño de tipografía. Actualizar desde link de componentes de "FIGMA-LINKS.3".
# Home
- Curva Alfa "Partikles" (instancia 1) debe entrar en la página desde abajo del viewport dejando un halo a modo de "intro visual"
# About
- Logo micro (D.DEZMU) animar entrada con giro en eje Z de dentro hacia afuera + escalado de opacity (0-100%). Animar la salida al revés.
- Starting point del div de texto con la bio ha de estar más bajo (mirar archivos de referencia para ver límites)
- About title ha de subir con scroll al igual que el div de bio. Ahora mismo se queda fijo.
- Se ha actualizado el ancho de los textos, la tipografía y la foto (ver en FIGMA-LINKS.3)
- Instancia 3 de "partikles" esta mal. Se ha creado una referencia visual en la carpeta del repo "VISUAL-REFERENCES" llamada "intancia3". Configurar los partikles con esta guía.
# Stack
Eliminar la instancia 4 (curva "gamma" se cancela de momento) y pasar directo de instancia 3 a 5 con una transición de partículas conectadas.
### Definición técnica de instancia 5 (stack)
En esta instancia los "partikles" se organizan formando una visualización de datos en 3D dentro de un espacio de incrustación tipo embeddings con múltiples grupos de "partikles" suspendidos en un vacío tridimensional. Cada grupo de partikles tiene una etiqueta con un "label" diferente, y una densidad de partículas distinta.
Un suelo de rejilla de perspectiva color blanco en la parte inferior. Ejes de coordenadas (X, Y, Z) delgados y brillantes que se interceptan en el centro. Estética de interfaz de usuario profesional minimalista, similar a TensorFlow Projector o a una visualización t-SNE. Fondo negro limpio, y enfoque nítido.
La idea es representar el skill-set del portfolio con un mapa 3D tipo embedding.
Para la creación de este espacio usar las referencias de la carpeta "VISUAL-REFERENCES":
- **embeddings-map.png - como inspiración de layout, disposición de clusters y estilo
- **labels-map.jpg** - como inspiración para la creación de etiquetas de texto. **Usar tipografía Heebo**
**El tamaño y densidad de cada "skill/grup of partikles" se definirá por un valor del 1 al 5, siendo: 1 = tamaño pequeño, 5 = tamaño y densidad alta (repartir equitativamente en el espacio disponible). A continuación se detalla la lista y valor de cada skill:**
- LLM - 5
- n8n - 3
- Workflows - 3 
- Agentic flows - 4
- Context engineering - 5
- Prompting -5
- MCP - 4
- API - 4
- RAG -3 
- Fine-tuning -2
- Embeddings - 2
- Design systems - 5
- UX - 5
- Design thinking - 3
- UI - 5
- Product - 3
- Figma - 5
- Prototyping - 4
- Touch designer -1
- Motion design - 1
- VSCode - 4
- Claude Code -3
- Codex - 4
- Python -1 
- React -2 
- Next.js - 1
- Node.js - 1
- Git -3
- WebGL - 2
- Three.js - 3
- GSAP - 2
- GLSL - 2
- Vercel - 2
- Supabase - 2
- PostgreSQL - 2
- Sound design - 3
- Mixing - 3
- mastering - 2
- Ableton Live - 4
- Max4live - 1

**Importante mantener la interacción 3D guiada que hay actualmente**
**Modificar la nebulosa actual por el mapa de embeddings**
**Eliminar la rotación y dejar la instancia estática**
**Asegurar que la instancia no supere el 50% del viewport**

 


# Contact
- Enlaces de mail e instagram deben entrar al toque del primer scroll, ahora mismo hay que bajar mucho para que acaben de posicionarse. Reducir recorrido del scroll al mínimo.
- Asomar enlaces bajo un overlay igual que el de la página de about.

# Menu
- Ahora mismo No hay "partikles" en la instancia 7. Se ha creado una referencia visual en la carpeta del repo "VISUAL-REFERENCES" llamada "intancia7". Configurar los partikles con esta guía.
- Añadir animación a button-close para que aumente de tamaño un 50% al hacer hover

# Mobile
- Los tamaños no están bien. Revisar Links de Figma en mobile y ajustar con fidelidad pantalla por pantalla. 
- Al modificar el tamaño del viewport para chequear el responsiveness, hay flasheos blancos en pantalla. Averiguar porqué y solucionarlo.

