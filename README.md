# web-diego-dezmu

Interactive portfolio built with React, Vite, TypeScript, GSAP, Three.js, and React Three Fiber. The app mixes route-driven DOM content with a persistent particle scene that morphs across the main sections of the site.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Stack

- React 19 + TypeScript + Vite
- React Router for section routing
- Zustand for shared interaction and scene state
- Three.js + React Three Fiber + Drei for the persistent WebGL layer
- GSAP for content reveal and section transitions

## Structure

- `src/app`: shell, routing, shared overlays, fallback handling
- `src/features/pages`: `home`, `about`, `stack`, and `contact` page content
- `src/scene`: particle system, stack embedding map, labels, and point generators
- `src/config`: copy, curve definitions, and scene presets
- `Material`: imported images and SVG assets
- `Visual-references`: non-runtime visual references for design iteration

## Current Experience

- `Home`: animated wordmark and role lockup over a Lissajous-based particle composition.
- `About`: scroll-driven biography reveal with a responsive portrait loaded through `<picture>` and a particle-frame transition in the scene.
- `Stack`: two-state interaction that morphs from the curve field into a 3D skill embedding map with orbit, inertia, touch gestures, zoom controls, and projected labels.
- `Contact`: wheel/touch-driven reveal for the email block and social placeholders with an upward particle exit transition.
- `Global`: animated menu overlay, pagination controls, custom cursor for non-touch devices, capability detection, and non-WebGL fallback backgrounds.

## Content and Scene Tuning

- Text content, section labels, and the stack taxonomy live in `src/config/content.ts`.
- Particle curve presets live in `src/config/curves.ts`.
- Device-tier scene presets live in `src/config/scenePresets.ts`.
- LFO modulation helpers for animated curve and particle parameters live in `src/scene/lfo.ts`.

## Update Log

### `we-diego-dezmu-4`

- Replaced the previous single About portrait asset with a responsive desktop/mobile pair: `Material/portrait-desktop.webp` and `Material/portrait-mobile.webp`.
- Reworked the `About` section to use direct scroll progress, title-triggered wheel/touch control, and a responsive image frame.
- Expanded the `Stack` section into a curve-to-embedding-map transition with grouped skills, orbit controls, zoom buttons, and projected labels in 3D space.
- Updated the particle scene to support the stack map transition, section-specific blends, and LFO-driven parameter modulation.
- Tightened shell-level interaction handling for menu overlay visibility, pointer interactivity, and WebGL fallback states.

## Validation

- `npm run lint`
- `npm run build`

## Notes

- The production build currently emits a large main chunk warning from Vite. The build succeeds, but route-level or scene-level code splitting would be the next optimization step if bundle size becomes a staging concern.
