# CLAUDE.md — Solar System Models

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

A two-screen SceneryStack simulation porting the NAAP **Solar System Models** lab,
scaffolded from `TemplateSingleSim`. Both screens now have complete models and
fully wired views (not scaffolding).

- **Ptolemaic System** (`src/ptolemaic/`) — port of the NAAP *Ptolemaic System Simulator* (`ptolemaic.swf`): the Earth-centered (geocentric) model with deferent + epicycle and the resulting view from Earth.
- **Planetary Configurations** (`src/configurations/`) — port of the NAAP *Planetary Configurations Simulator* (`configurationsSimulator.swf`): the Sun-centered system and the configurations (opposition, conjunction, elongation) that Earth and another planet form.

Shared code keeps the `SolarSystemModels` prefix; per-screen code uses the
`Ptolemaic` / `Configurations` prefixes. Concept-named folders, no `-screen` suffix.

## Key files

| File | Purpose |
|---|---|
| `src/SolarSystemModelsColors.ts` | All `ProfileColorProperty` instances (default + projector) |
| `src/SolarSystemModelsConstants.ts` | Named numeric constants (layout px, physics SI units) |
| `src/SolarSystemModelsNamespace.ts` | Namespace used by `.register()` |
| `src/common/SolarSystemModelsPanel.ts` | Pre-themed `Panel` wrapper (uses `SolarSystemModelsColors`) |
| `src/common/TimeModel.ts` | Composable play/pause + elapsed-time model for animated sims |
| `src/i18n/StringManager.ts` | Singleton localized string accessor; per-screen name + a11y getters |
| `src/main.ts` | Entry point; registers both screens with the Sim |
| `src/ptolemaic/PtolemaicScreen.ts` | `Screen<PtolemaicModel, PtolemaicScreenView>` wrapper |
| `src/ptolemaic/model/PtolemaicModel.ts` | Ptolemaic screen state: deferent/epicycle geometry, presets, memory |
| `src/ptolemaic/view/PtolemaicScreenView.ts` | Ptolemaic visuals, `screenSummaryContent` + `pdomOrder` |
| `src/configurations/ConfigurationsScreen.ts` | `Screen<ConfigurationsModel, ConfigurationsScreenView>` wrapper |
| `src/configurations/model/ConfigurationsModel.ts` | Configurations screen state: orbits, synodic events, timeline |
| `src/configurations/view/ConfigurationsScreenView.ts` | Configurations visuals, `screenSummaryContent` + `pdomOrder` |
| `src/preferences/solarSystemModelsQueryParameters.ts` | `QueryStringMachine` parameters |
| `scripts/decompile-flash.ts` | Extract ActionScript from the NAAP Flash `.swf` sources via JPEXS FFDec (→ `NAAP/decompiled/`) |

## Screens

Two screens registered in `src/main.ts`, in this order:

1. **Ptolemaic System** (`src/ptolemaic/`) — Ptolemaic System Simulator
2. **Planetary Configurations** (`src/configurations/`) — Planetary Configurations Simulator

When implementing: put shared physics in `src/common/`, per-screen state in each
`*Model.ts`. Per-screen a11y lives under `a11y.<screenKey>` in each locale JSON,
exposed via `StringManager.getPtolemaicA11yStrings()` /
`getConfigurationsA11yStrings()`. Make each `currentDetailsContent` a live
`DerivedProperty` over model state and add `accessibleName`s to every interactive node.

## Decompiling the Flash sources

`npm run decompile` (script: `scripts/decompile-flash.ts`) extracts readable
ActionScript from the NAAP Flash movies so the port can be diffed against the
originals. The `.fla` files are old binary projects no tool reads directly, so the
script decompiles their sibling compiled `.swf` via **JPEXS FFDec** (needs Java).

```sh
npm run decompile                 # the two SSM simulators → NAAP/decompiled/<name>/scripts/*.as
npm run decompile -- --all        # the two simulators + supporting concept demos
npm run decompile -- --list       # dry run: print what would be decompiled
npm run decompile -- --setup      # one-time: download FFDec into tools/ffdec/
```

By default the two primary simulators decompile (one per screen):
`ptolemaic023-C` (Ptolemaic System) and `configurationsSimulator044-C` (Planetary
Configurations). Output goes to `NAAP/decompiled/` (git-ignored, along with
`tools/ffdec/`). The decompiled AS is a **read-only reference** — transcribe the
maths into typed TS in `src/`; don't vendor it.

## npm scripts

`start`/`dev` (vite) · `build` · `build:single` · `check` (tsc) · `lint`/`fix` (biome) ·
`test` (vitest) · `icons` · `decompile` · `rename`. Gate: `npm run check && npm run lint && npm run build && npm test`.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
