# CLAUDE.md — Solar System Models

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack port of the NAAP **Solar System Models** lab. Two screens compare geocentric (Ptolemaic deferent + epicycle) and heliocentric (planetary configurations) explanations for retrograde motion. Architecture and formulas: [doc/model.md](doc/model.md), [doc/implementation-notes.md](doc/implementation-notes.md).

- **Ptolemaic System** (`src/ptolemaic/`) — Earth-centered deferent, epicycle, and equant; zodiac longitude trail.
- **Planetary Configurations** (`src/configurations/`) — Sun-centered circular orbits; opposition, conjunction, elongation; synodic event timeline.

Shared code uses the `SolarSystemModels` prefix; per-screen code uses `Ptolemaic` / `Configurations`. Concept-named folders, no `-screen` suffix.

## Key files

| Area | Location |
|---|---|
| Screens | `src/ptolemaic/PtolemaicScreen.ts`, `src/configurations/ConfigurationsScreen.ts` |
| Models | `ptolemaic/model/PtolemaicModel.ts`, `PtolemaicPlanet.ts`, `configurations/model/ConfigurationsModel.ts`, `ConfigurationsPlanet.ts` |
| Shared zodiac data | `src/common/ZodiacConstellationsData.ts`, `ZodiacStripBackground.ts` |
| Shared UI | `src/common/SolarSystemModelsPanel.ts`, `SolarSystemModelsButtonOptions.ts`, `SolarSystemModelsControlOptions.ts` |
| Animation | `src/common/TimeModel.ts` (Configurations uses `animationRateProperty`; Ptolemaic uses model-local rate) |
| Colors / constants | `src/SolarSystemModelsColors.ts`, `src/SolarSystemModelsConstants.ts` |
| Strings | `src/i18n/StringManager.ts` |
| Preferences | `src/preferences/` (empty scaffold + query params) |
| Entry | `src/main.ts` |

## Model

Two **independent** screen models — no shared root state.

| Screen | Model | Notes |
|---|---|---|
| **Ptolemaic** | `PtolemaicModel` | Deferent + epicycle + **equant** (uniform motion as seen from equant, not Earth); superior vs inferior planet drives which angle follows the Sun; ecliptic longitude trail; store/recall memory; presets for Venus, Mars, Jupiter, Saturn |
| **Configurations** | `ConfigurationsModel` | Planet 1 = observer, planet 2 = target on circular orbits (`period = a^1.5` AU/years); signed elongation; synodic period `T_syn = 1/(1/P_inner − 1/P_outer)`; imperative timeline with RUN/PAUSE/STOP at alignments |

**Shared gotchas**

- Ptolemaic **superior** planets: deferent driven by planet anomaly, epicycle locked to Sun angle; **inferior** planets swap roles.
- Sun moves at fixed rate ≈ 2π/365.25 rad/day on a circle of radius **2.25** deferent units.
- **Split animation-rate semantics**: Ptolemaic uses `animationRateProperty` in **days/sec** (1–500); Configurations uses `TimeModel.animationRateProperty` as a **0–6×** multiplier. Neither model uses `TimeModel.timeProperty` for physics.
- Flash-faithful equant math lives in `computeEpicycleCenter` — preserve unless porting fidelity changes.

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
Each screen registers `*ScreenSummaryContent` and explicit `pdomOrder` on its `*ScreenView`. A11y strings live under `a11y.ptolemaic` and `a11y.configurations` in each locale JSON, via `StringManager.getPtolemaicA11yStrings()` / `getConfigurationsA11yStrings()`. Keep `currentDetailsContent` live over model state; every interactive node needs an `accessibleName`.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | Test environment + `setupFiles`; `execArgv: ["--expose-gc"]` with memory-leak suite |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/**/*.test.ts` | Model/physics unit tests |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

| File | Covers |
|---|---|
| `PtolemaicModel.test.ts` | Geometry, retrograde, superior/inferior swap, memory, trail |
| `ConfigurationsModel.test.ts` | Kepler, elongation, synodic, event times/names, slew, timeline |
| `TimeModel.test.ts` | Play/pause, animation rate default |
| `memory-leak.test.ts` | Dispose regression |

- Put unit tests only under root `tests/` (never co-locate or use `__tests__/`).
- Run `npm test`. CI runs the suite when a `test` script is present.

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

## Development notes

- `ConfigurationsZodiacStrip` and `PtolemaicZodiacStrip` are separate view nodes; `MotionsOfTheSun/` cherry-picks constellation data and strip mapping from here.
- **`npm run decompile`** extracts NAAP Flash ActionScript via JPEXS FFDec into gitignored `NAAP/decompiled/` — read-only reference.
- After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
