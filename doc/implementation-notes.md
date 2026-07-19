# Implementation Notes - Solar System Models

Developer-facing notes on the architecture. Educator-facing physics are in [model.md](./model.md).

## Architecture Overview

Two independent screens; no shared root model.

```
src/main.ts
  ├─ PtolemaicScreen        (Screen<PtolemaicModel, PtolemaicScreenView>)
  └─ ConfigurationsScreen   (Screen<ConfigurationsModel, ConfigurationsScreenView>)

src/ptolemaic/
  PtolemaicScreen.ts
  model/PtolemaicModel.ts, PtolemaicPlanet.ts
  view/PtolemaicScreenView.ts, PtolemaicOrbitNode.ts, PtolemaicZodiacStrip.ts, …

src/configurations/
  ConfigurationsScreen.ts
  model/ConfigurationsModel.ts, ConfigurationsPlanet.ts, EventNameKey.ts, EventAction.ts
  view/ConfigurationsScreenView.ts, ConfigurationsOrbitNode.ts, ConfigurationsZodiacStrip.ts, …

src/common/
  TimeModel.ts                    play/pause; Configurations also uses animationRateProperty
  SolarSystemModelsPanel.ts, SolarSystemModelsButtonOptions.ts, SolarSystemModelsControlOptions.ts
  ZodiacConstellationsData.ts, ZodiacStripBackground.ts

src/SolarSystemModelsConstants.ts   ranges, presets, layout
src/preferences/                    empty scaffold + query params
```

Data flows Model → View through AXON `Property` / `DerivedProperty`. Models never import views.

## PtolemaicModel

**DerivedProperty chain** for deferent center, epicycle center (equant geometry), geocentric position,
ecliptic longitude.

| Property | Role |
|---|---|
| Sliders | `epicycleSizeProperty`, `eccentricityProperty`, `motionRateProperty`, `apogeeAngleProperty` |
| Planet | `planetTypeProperty`, `presetProperty` |
| Time | `ptolemaicTimeProperty` (days), `anomalyProperty`, `sunAngleProperty` |
| Animation | `animationRateProperty` (days/sec, 1–500); `timer.isPlayingProperty` only from `TimeModel` |
| Trail | `pathDurationProperty` (years of longitude history) |
| Memory | `storeMemory` / `recallMemory` |

**API:** `applyPreset`, `setSunAngle`, `clearTrail`, `resetTime`, `samplePlanetPosition`, `getSunRate` /
`getAnomalyRate`.

`step(dt)`: `dtDays = dt × animationRate`; angles += rate × dtDays.

Static `ModelViewTransform2` wrapped in `Property` for diagram scaling.

## ConfigurationsModel

Circular Kepler orbits; **planet 1 = observer**, **planet 2 = target**.

| Property | Role |
|---|---|
| Orbits | `semimajorAxis1Property`, `semimajorAxis2Property`, `epochAngle1Property`, `epochAngle2Property` |
| Periods | `period1Property`, `period2Property` — **mutable `NumberProperty`**, not derived (epoch-preserving updates) |
| Time | `timeProperty` (years), `nextEventTimeProperty`, `currentCycleNumberProperty` |
| Schedule | `synodicPeriodProperty`, `cycleOffsetProperty`, `eventTimesListProperty`, `eventNamesProperty` |
| Playback | `eventActionProperty` (`RUN` \| `PAUSE` \| `STOP`); private `slewActive`, `countdownElapsed` |
| Animation | `timer.animationRateProperty` (0–6×); `timer.isPlayingProperty` |

**Schedule:** `calculateSystemProperties()` imperatively writes synodic schedule Properties (not a single
`DerivedProperty` bundle). Called from constructor, `setSemimajorAxis`, epoch changes, `reset`.

**API highlights:** `setSemimajorAxis(id, newA, keepEpochFixed?)`, `setTime`, `setTimeByCycleAndEventNumbers`,
`slewToEvent` (0.65 s ease), `setTimeByPlanetAngle`, `applyPreset`, `reset`.

`step(dt)`: if slewing → cubic ease; if countdown → PAUSE hold; else advance time and snap on events.

Reactive `ModelViewTransform2` on `ConfigurationsScreenView.mvtProperty`.

## EventNameKey naming caveat

`OUTER_OBSERVER_EVENT_KEYS` holds opposition/conjunction names but is used when **a₁ &lt; a₂** (planet 1
inner observer). `INNER_OBSERVER_EVENT_KEYS` holds inferior/superior names when **a₁ &gt; a₂**. Constant
names are inverted relative to usage — describe behavior by *a*₁ vs *a*₂, not by constant identifiers.

## Key design decisions

1. **Split animation-rate semantics** — Ptolemaic uses model `animationRateProperty` (days/sec);
   Configurations uses `TimeModel.animationRateProperty` (0–6×). Neither model uses `TimeModel.timeProperty`
   for physics.
2. **Imperative synodic schedule** — epoch angles shift event times within each cycle.
3. **Flash-faithful Ptolemaic equant math** in `computeEpicycleCenter`.
4. **ConfigurationsZodiacStrip** — Flash-style ecliptic starfield; Ptolemaic uses separate strip node.

## Common components

- `SolarSystemModelsPanel`, `SolarSystemModelsButtonOptions`, `SolarSystemModelsControlOptions`.
- `ZodiacConstellationsData`, `ZodiacStripBackground`.

## Disposal

Screen-lifetime architecture.

## Testing

| File | Covers |
|---|---|
| `PtolemaicModel.test.ts` | Geometry, retrograde, superior/inferior swap, memory, trail |
| `ConfigurationsModel.test.ts` | Kepler, elongation, synodic, event times/names, slew, timeline |
| `TimeModel.test.ts` | Play/pause, animation rate default |
| `memory-leak.test.ts` | Dispose regression |

## Multi-screen

Independent state — see [multi-screen.md](./multi-screen.md).

Flash decompile: `ptolemaic023-C`, `configurationsSimulator044-C` via `npm run decompile`.
