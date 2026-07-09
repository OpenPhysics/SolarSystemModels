# Solar System Models

A two-screen [SceneryStack](https://scenerystack.org/) port of the NAAP **Solar System Models** lab:
**Ptolemaic System** and **Planetary Configurations**. Built with Vite 8, TypeScript 7, and Biome 2.

## Features

- Two screens with complete models and wired views (not scaffolding)
- English, French, and Spanish localization via `StringManager`
- Default and projector color profiles
- Progressive Web App (installable, offline-capable)
- Model-layer Vitest coverage
- Flash decompile workflow (`npm run decompile`) for NAAP `.swf` reference
- Git hooks for Biome pre-commit checks
- Shared GitHub Actions CI via `OpenPhysics/Baton`

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run build:single` | Single self-contained `dist/index.html` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm test` | Run Vitest unit tests |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run decompile` | Extract ActionScript from NAAP Flash `.swf` sources |
| `npm run clean` | Remove `dist/` |

Quality gate: `npm run check && npm run lint && npm run build && npm test`.

Keep `name` in kebab-case in `package.json`; it is separate from the SceneryStack sim identifier in `src/init.ts`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [Vitest](https://vitest.dev/) | ^4 | Unit tests |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenPhysics org license](https://github.com/OpenPhysics/.github/blob/main/LICENSE).

## Contributing

See [OpenPhysics contributing guidelines](https://github.com/OpenPhysics/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
