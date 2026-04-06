# Diego Dezmu Portfolio

A personal portfolio built with React, Vite, TypeScript, and React Three Fiber. It combines route-driven content with a persistent WebGL particle scene that morphs across the experience instead of resetting between pages.

At the center of the site is an interactive particle system shaped by Lissajous curves, tuned across device tiers, and backed by graceful fallbacks when WebGL or motion-heavy effects are not available.

## Preview

![Portfolio preview](./docs/preview.png)

Diego can replace `./docs/preview.png` with a current screenshot or GIF before publishing the repository.

## Tech Stack

- React 19
- Vite
- TypeScript
- React Three Fiber
- Zustand
- GSAP
- CSS Modules

## Highlights

- Persistent particle scene driven by Lissajous curves and route-aware morph targets
- Adaptive GPU tier system that scales particle density and sizing per device capability
- Graceful degradation with WebGL capability detection and fallback backgrounds
- `prefers-reduced-motion` support and touch-aware interaction handling
- Orchestrated page transitions shared between the DOM layer and the persistent scene

## Project Structure

```text
src/
├── app/                App shell, routing, intro curtain, fallbacks, and transition orchestration
├── assets/             Fonts, portraits, and fallback imagery bundled through Vite
├── config/             Copy, feature flags, curve definitions, and scene presets
├── features/           Page-level UI plus layout, navigation, and menu modules
├── scene/              Persistent R3F particle scene, generators, and stack embedding logic
├── shared/             Reusable components, utilities, assets, and shared types
└── state/              Zustand store coordinating UI state and scene state
```

## Run Locally

```bash
git clone https://github.com/[USUARIO]/[REPO].git
cd [REPO]
npm install
npm run dev
```

No environment variables or API keys are required.

## Production

https://diegodezmu.com

## Author

Diego Dezmu

## License

MIT
