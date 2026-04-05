# INFORME-1A-CODIGO

## Resumen ejecutivo
- Se auditaron 46 archivos `src/**/*.{ts,tsx,js,jsx}` y 1 archivo de tooling (`vite.config.ts`).
- `package.json` declara 22 dependencias: 8 de produccion y 14 de desarrollo.
- Se detectaron 10 paquetes realmente importados en el proyecto y 12 `devDependencies` sin imports directos.
- No se detectaron componentes huerfanos.
- No se detectaron variables locales muertas ni imports sin uso.
- Se detectaron 8 exports muertos sin consumidores externos.
- Solo hay 2 archivos sin referencias entrantes y ambos parecen legitimos: el entrypoint y un archivo de tipos ambient.
- Si existe un sistema de tiers para R3F/WebGL; ajusta `deviceTier`, `count`, `sizePx` y `dpr`.
- No se encontraron `console.log`, `console.warn`, `console.error`, `debugger`, `TODO`, `FIXME`, `HACK` ni bloques de codigo comentado de mas de 2 lineas.

## Inventario completo de dependencias

| Ambito | Nombre | Version | Importada |
| --- | --- | --- | --- |
| dependencies | `@react-three/drei` | `^10.7.7` | si |
| dependencies | `@react-three/fiber` | `^9.4.0` | si |
| dependencies | `gsap` | `^3.13.0` | si |
| dependencies | `react` | `^19.2.4` | si |
| dependencies | `react-dom` | `^19.2.4` | si |
| dependencies | `react-router-dom` | `^7.9.6` | si |
| dependencies | `three` | `^0.181.1` | si |
| dependencies | `zustand` | `^5.0.8` | si |
| devDependencies | `@eslint/js` | `^9.39.4` | no |
| devDependencies | `@types/node` | `^24.12.0` | no |
| devDependencies | `@types/react` | `^19.2.14` | no |
| devDependencies | `@types/react-dom` | `^19.2.3` | no |
| devDependencies | `@types/three` | `^0.181.0` | no |
| devDependencies | `@vitejs/plugin-react` | `^6.0.1` | si |
| devDependencies | `eslint` | `^9.39.4` | no |
| devDependencies | `eslint-plugin-react-hooks` | `^7.0.1` | no |
| devDependencies | `eslint-plugin-react-refresh` | `^0.5.2` | no |
| devDependencies | `globals` | `^17.4.0` | no |
| devDependencies | `typescript` | `~5.9.3` | no |
| devDependencies | `typescript-eslint` | `^8.57.0` | no |
| devDependencies | `vite` | `^8.0.1` | si |
| devDependencies | `vitest` | `^4.1.2` | no |

## Dependencias no utilizadas

| Nombre | Version | Motivo |
| --- | --- | --- |
| `@eslint/js` | `^9.39.4` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `@types/node` | `^24.12.0` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `@types/react` | `^19.2.14` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `@types/react-dom` | `^19.2.3` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `@types/three` | `^0.181.0` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `eslint` | `^9.39.4` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `eslint-plugin-react-hooks` | `^7.0.1` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `eslint-plugin-react-refresh` | `^0.5.2` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `globals` | `^17.4.0` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `typescript` | `~5.9.3` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `typescript-eslint` | `^8.57.0` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |
| `vitest` | `^4.1.2` | Sin imports/requires/import() detectados; si se usa, es solo por CLI, tipado o tooling. |

## Exports muertos

Criterio usado: un export se considera muerto si no tiene imports desde otro archivo del proyecto. El uso interno dentro del propio modulo no cuenta como consumidor externo.

| Archivo | Export | Tipo |
| --- | --- | --- |
| `src/config/content.ts` | `stackGroupPalette` | `named const` |
| `src/config/scenePresets.ts` | `scenePresets` | `named const` |
| `src/scene/generators/grids.ts` | `generateMarginGridPoints` | `named function` |
| `src/scene/generators/stackEmbedding.ts` | `mapTransitionPointsToStack` | `named function` |
| `src/shared/types.ts` | `LfoTarget` | `named type` |
| `src/shared/utils/device.ts` | `getDeviceTier` | `named function` |
| `src/shared/utils/stackZoom.ts` | `getStackZoomMaxForWidth` | `named function` |
| `src/shared/utils/stackZoom.ts` | `getDefaultStackZoomForWidth` | `named function` |

## Componentes huerfanos

Ninguno.

## Variables/funciones muertas

No encontradas. El proyecto compila limpio con `tsconfig.app.json` y `noUnusedLocals/noUnusedParameters` activos.

## Imports no utilizados

No encontrados.

## Estado del sistema de tiers

Sistema encontrado. No esta centralizado en un solo modulo, pero si existe una estrategia coherente de degradacion y ajuste de escena:

- `src/shared/utils/device.ts`
  - `detectCapabilities()` clasifica `deviceTier` como `desktop`, `tablet`, `mobile` o `lowPower`.
  - La decision usa `window.innerWidth`, `navigator.deviceMemory`, `navigator.hardwareConcurrency` y `prefers-reduced-motion`.
  - `lowPower` se activa si el ancho es `<= 767`, si la memoria es `<= 4`, si la concurrencia es `<= 4` o si hay `reducedMotion`.
- `src/config/scenePresets.ts`
  - `getPresetForTier(mode, tier)` aplica escalado por tier a los presets de escena.
  - Parametros controlados:
    - `count` de particulas con escala por tier: `desktop=1`, `tablet=0.84`, `mobile=0.72`, `lowPower=0.6`.
    - `sizePx` con escala por tier: `desktop=1`, `tablet=0.94`, `mobile=0.9`, `lowPower=0.88`.
  - `count` queda ademas limitado por un minimo de `1800`.
- `src/scene/useSceneSnapshot.ts`
  - Consume `deviceTier` desde `useAppStore`.
  - Genera presets efectivos por tier para `homeAlpha`, `aboutBeta`, `aboutFrame`, `stackGamma`, `stackEmbeddingMap`, `contactDelta`, `contactDeltaOut` y `menuGrid`.
  - En la practica, el tier afecta directamente la densidad y tamano de la nube de particulas de todas las escenas.
- `src/scene/SceneCanvas.tsx`
  - Ajusta el `dpr` del `Canvas` por tier:
    - `desktop`: `[1, 1.85]`
    - `tablet`: `[1, 1.45]`
    - `mobile`: `[1, 1.2]`
    - `lowPower`: `[1, 1.05]`
  - Mantiene `gl.powerPreference = 'high-performance'`.
- `src/shared/utils/webgl.ts` y `src/app/AppShell.tsx`
  - Complementan el sistema con deteccion de soporte WebGL y fallback visual cuando la escena 3D no puede renderizarse.

Conclusiones sobre tiers:

- Si hay sistema de tiers.
- Controla principalmente `deviceTier`, `count`, `sizePx` y `dpr`.
- No se ve un tier manager unico que cambie sombras, postprocesado, antialias o complejidad de materiales; la degradacion esta enfocada en densidad de particulas y resolucion efectiva del canvas.

## Artefactos de desarrollo

- `console.log / console.warn / console.error`: no encontrados.
- `debugger`: no encontrado.
- `TODO / FIXME / HACK`: no encontrados.
- Codigo comentado en bloques de mas de 2 lineas: no encontrado.
- Si existen comentarios documentales y de configuracion en `vite.config.ts`, `tsconfig.*`, `src/config/content.ts`, `src/config/appFlags.ts` y `src/scene/ParticleField.tsx`, pero no son codigo comentado.

## Mapa de archivos sin referencias entrantes

| Archivo | Tipo | Observacion |
| --- | --- | --- |
| `src/main.tsx` | `entrypoint` | Archivo de entrada legitimo; debe ser referenciado por Vite/HTML y no por imports internos. |
| `src/vite-env.d.ts` | `ambient types` | Archivo de tipos ambient legitimo; su efecto es global y no requiere imports. |

No se detectaron archivos `config`, `types`, `utils` u `hooks` sin referencias entrantes fuera de estos dos casos legitimos.

## Apendice A - Inventario de exports por archivo

- `src/App.tsx`: `default`
- `src/app/AppShell.tsx`: `AppShell`
- `src/app/IntroCurtain.tsx`: `IntroCurtain`
- `src/app/pageTransition.ts`: `PAGE_TITLE_EXIT_DURATION_S`, `PAGE_TITLE_EXIT_DURATION_MS`, `PAGE_TITLE_EXIT_EASE`, `PAGE_TITLE_EXIT_DISTANCE`, `PAGE_TITLE_SECONDARY_EXIT_DISTANCE`
- `src/app/usePageTransitionNavigation.ts`: `shouldInterceptPageTransitionClick`, `usePageTransitionNavigation`
- `src/config/appFlags.ts`: `INTRO_CURTAIN_ENABLED`
- `src/config/content.ts`: `PARTICLE_TINT_COLOR`, `sectionOrder`, `sectionLabels`, `siteContent`, `stackGroupPalette`, `stackSkillSpecs`
- `src/config/curves.ts`: `CurveSceneConfig`, `alphaConfig`, `betaConfig`, `gammaConfig`, `deltaConfig`, `aboutMarginGridConfig`, `stackEmbeddingMapConfig`, `menuGridConfig`
- `src/config/scenePresets.ts`: `EXPLODE_PRESETS`, `scenePresets`, `getPresetForTier`, `sectionToSceneMode`
- `src/features/layout/Header.tsx`: `Header`
- `src/features/menu/MenuOverlay.tsx`: `MenuOverlay`
- `src/features/navigation/MenuToggle.tsx`: `MenuToggle`
- `src/features/navigation/PaginationControls.tsx`: `PaginationControls`
- `src/features/pages/AboutPage.tsx`: `AboutPage`
- `src/features/pages/ContactPage.tsx`: `ContactPage`
- `src/features/pages/HomePage.tsx`: `HomePage`
- `src/features/pages/StackPage.tsx`: `StackPage`
- `src/features/pages/stack/useStackCamera.ts`: `useStackCamera`
- `src/features/pages/stack/useStackGestures.ts`: `useStackGestures`
- `src/features/pages/stack/useStackTransition.ts`: `useStackTransition`
- `src/main.tsx`: sin exports
- `src/scene/ParticleField.tsx`: `ParticleField`
- `src/scene/ParticleScene.tsx`: `ParticleScene`
- `src/scene/SceneCanvas.tsx`: `SceneCanvas`
- `src/scene/StackEmbeddingMap.tsx`: `StackEmbeddingMap`
- `src/scene/StackLabels.tsx`: `StackLabels`
- `src/scene/generators/bufferTransforms.ts`: `fitPointCount`
- `src/scene/generators/curves.ts`: `fillLissajousPoints`
- `src/scene/generators/grids.ts`: `createGridSegments`, `generateViewportGridPoints`, `generateMarginGridPoints`, `generateFrameScatterPoints`
- `src/scene/generators/shared.ts`: `mulberry32`, `gaussian`, `hashUnit`, `hashSigned`, `hashString`, `toTuple`, `clamp`, `fillBufferPoint`
- `src/scene/generators/stackEmbedding.ts`: `STACK_CUBE_CENTER_Y`, `mapTransitionPointsToStack`, `generateStackSceneData`
- `src/scene/lfo.ts`: `resolveLfoSceneParameters`
- `src/scene/types.ts`: `StackSkillDatum`, `SceneSnapshot`, `StackSceneData`
- `src/scene/useSceneCamera.ts`: `useSceneCamera`
- `src/scene/useSceneSnapshot.ts`: `useSceneSnapshot`
- `src/shared/assets.ts`: `assets`
- `src/shared/components/CustomCursor.tsx`: `CustomCursor`
- `src/shared/components/InlineIcons.tsx`: `ChevronLeftIcon`, `ChevronRightIcon`, `ZoomInIcon`, `ZoomOutIcon`
- `src/shared/components/MicroLogo.tsx`: `MicroLogo`
- `src/shared/components/PageTitle.tsx`: `PageTitle`
- `src/shared/types.ts`: `AppSection`, `SceneMode`, `DeviceTier`, `LfoWave`, `LfoSlotId`, `PointerState`, `Capabilities`, `CurveDefinition`, `LfoCurveKey`, `ParticleTuning`, `LfoParticleKey`, `LfoTarget`, `LfoConfig`, `LfoBank`, `StackSkillGroup`, `StackSkillSpec`, `ScenePreset`
- `src/shared/utils/device.ts`: `getDeviceTier`, `detectCapabilities`
- `src/shared/utils/stackZoom.ts`: `STACK_ZOOM_MIN`, `STACK_ZOOM_STEP`, `getStackZoomMaxForWidth`, `getDefaultStackZoomForWidth`, `getStackZoomMax`, `getDefaultStackZoom`
- `src/shared/utils/webgl.ts`: `supportsWebGL`
- `src/state/appStore.ts`: `DEFAULT_STACK_THETA`, `DEFAULT_STACK_PHI`, `DEFAULT_STACK_RADIUS`, `useAppStore`
- `src/vite-env.d.ts`: sin exports
