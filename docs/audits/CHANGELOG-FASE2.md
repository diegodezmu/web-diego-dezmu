# CHANGELOG-FASE2

Fecha: 2026-04-05

## Exports eliminados

| Archivo | Export | Acción tomada |
| --- | --- | --- |
| `src/config/content.ts` | `stackGroupPalette` | Declaración eliminada por no tener uso interno ni externo. |
| `src/config/scenePresets.ts` | `scenePresets` | Se retiró `export`; la constante permanece para uso interno de `getPresetForTier()`. |
| `src/scene/generators/grids.ts` | `generateMarginGridPoints` | Función eliminada por no tener uso interno ni externo. |
| `src/scene/generators/stackEmbedding.ts` | `mapTransitionPointsToStack` | Función y tipo auxiliar eliminados por no tener uso interno ni externo. |
| `src/shared/types.ts` | `LfoTarget` | Se retiró `export`; el tipo permanece para uso interno de `LfoConfig`. |
| `src/shared/utils/device.ts` | `getDeviceTier` | Se retiró `export`; la función permanece para uso interno de `detectCapabilities()`. |
| `src/shared/utils/stackZoom.ts` | `getStackZoomMaxForWidth` | Se retiró `export`; la función permanece para uso interno de `getStackZoomMax()` y `getDefaultStackZoom()`. |
| `src/shared/utils/stackZoom.ts` | `getDefaultStackZoomForWidth` | Se retiró `export`; la función permanece para uso interno de `getDefaultStackZoom()`. |

## Assets eliminados

- `Material/icon-chevron-left.svg`
- `Material/icon-chevron-right.svg`
- `Material/icon-zoom-in.svg`
- `Material/icon-zoom-out.svg`
- Directorio legacy `Material/` eliminado tras mover los assets de producción y la licencia local de `Michroma`.

## Movimientos de archivos

| Ruta anterior | Ruta nueva | Motivo |
| --- | --- | --- |
| `Material/portrait-desktop.webp` | `src/assets/images/portrait-desktop.webp` | Mover imagen de producción al pipeline de Vite. |
| `Material/portrait-mobile.webp` | `src/assets/images/portrait-mobile.webp` | Mover imagen de producción al pipeline de Vite. |
| `Material/Michroma/Michroma-Regular.ttf` | `src/assets/fonts/Michroma-Regular.ttf` | Mover fuente de producción al pipeline de Vite. |
| `Material/Michroma/OFL.txt` | `docs/licenses/Michroma-OFL.txt` | Preservar la licencia al eliminar `Material/`. |
| `INFORME-1A-CODIGO.md` | `docs/audits/INFORME-1A-CODIGO.md` | Sacar informes de auditoría de la raíz del repositorio. |
| `INFORME-1B-ASSETS.md` | `docs/audits/INFORME-1B-ASSETS.md` | Sacar informes de auditoría de la raíz del repositorio. |
| `INFORME-1C-BUNDLE.md` | `docs/audits/INFORME-1C-BUNDLE.md` | Sacar informes de auditoría de la raíz del repositorio. |
| `formalización-proyecto.md` | `docs/audits/formalizacion-proyecto.md` | Reubicar documentación técnica histórica fuera de raíz y normalizar el nombre a ASCII. |
| `GEMINI.md` | `docs/tooling/GEMINI.md` | Reubicar nota/tooling protocol fuera de raíz. |

## Problemas encontrados durante la reorganización

- El primer `npm run build` del Bloque A falló por una limpieza demasiado agresiva de imports en `src/scene/generators/stackEmbedding.ts`: `hashSigned` seguía teniendo uso interno. Se restauró el import y no fue necesario revertir ninguna eliminación de export muerto.
- Los tests unitarios dependían de varios símbolos que pasaron a ser internos (`scenePresets`, `getDeviceTier`, `getStackZoomMaxForWidth`, `getDefaultStackZoomForWidth`). Se reescribieron para validar comportamiento público sin reabrir la API.
- La estrategia de carga de `SceneCanvas` no se modificó. El chunk async principal sigue siendo `dist/assets/SceneCanvas-CkKe5nhF.js` con `897.61 kB` raw, tal y como exigía la restricción explícita.
- Se eliminó el directorio vacío `Documents/` y el archivo de sistema `.DS_Store` de raíz como parte de la normalización estructural.

## Resultado del build final

- `npm run build` -> OK
- `npm test` -> OK (`5` archivos, `18` tests)
- Assets fingerprinted emitidos correctamente en `dist/assets/`:
  - `dist/assets/Michroma-Regular-Dh3F2K_p.ttf`
  - `dist/assets/portrait-desktop-ZG-FnmAC.webp`
  - `dist/assets/portrait-mobile-BSv-mKej.webp`
