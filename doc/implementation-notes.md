# Implementation Notes - Solar System Models

## Architecture overview

Two independent screens, each a standard `Screen<Model, ScreenView>` pairing (see
[.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md) for the general
SceneryStack Model/View pattern this follows). The screens share no model state — each owns its own
`Model` — but share layout/color/i18n infrastructure at the `src/` root and in `src/common/`.

```
main.ts
  ├─ PtolemaicScreen                     (Screen<PtolemaicModel, PtolemaicScreenView>)
  │    ├─ PtolemaicModel                  deferent/epicycle/equant geometry, presets, memory store/recall
  │    └─ PtolemaicScreenView             orbit diagram, "view from Earth" zodiac strip, path trail
  └─ ConfigurationsScreen                 (Screen<ConfigurationsModel, ConfigurationsScreenView>)
       ├─ ConfigurationsModel             Kepler orbits, elongation, synodic event schedule, timeline
       └─ ConfigurationsScreenView        orbit diagram, elongation indicator, zodiac strip, timeline

src/common/
  ├─ TimeModel.ts               composable play/pause + elapsed-time model; both screen models compose one
  ├─ CelestialBodyNode.ts        Circle auto-positioned from a model Vector2 Property + a reactive
  │                              ModelViewTransform2 Property; used for Earth/Sun/planet markers
  ├─ SolarSystemModelsPanel.ts   pre-themed Panel wrapper (all screens share SolarSystemModelsColors)
  ├─ ZodiacConstellationNode.ts  and ZodiacConstellationsData.ts — the shared starfield background
  └─ ZodiacStripBackground.ts    shared "band of sky" backdrop used by both screens' zodiac strips

src/preferences/
  ├─ SolarSystemModelsPreferencesModel   scaffold (empty — no sim-specific Properties yet; tandem reserved)
  ├─ SolarSystemModelsPreferencesNode    pref UI shown in Preferences → Simulation
  └─ solarSystemModelsQueryParameters    query-parameter declarations
```

Data flows Model → View through AXON `Property` objects; views observe via `.link()`, `.lazyLink()`, or
`Multilink.multilink()` and update reactively. Neither model imports from its own `view/`.

## Model components

### PtolemaicModel

Owns the deferent/epicycle/equant geometry (see [model.md](./model.md) for the math) as a chain of
`DerivedProperty`s keyed on the adjustable parameters (`epicycleSizeProperty`, `eccentricityProperty`,
`apogeeAngleProperty`, `motionRateProperty`, `planetTypeProperty`) plus the two time-driven angles
(`sunAngleProperty`, `anomalyProperty`), which `step(dt)` advances (wrapped to `[0, 2π)` so they don't
lose precision over a long play session). `applyPreset`/`storeMemory`/`recallMemory` implement the
preset combo box and the memory-recall buttons from the original Flash sim.

### ConfigurationsModel

Owns the two Kepler orbits (`semimajorAxis{1,2}Property`, `period{1,2}Property`,
`epochAngle{1,2}Property`) and the derived synodic/event schedule
(`synodicPeriodProperty`, `cycleOffsetProperty`, `eventTimesListProperty`, `eventNamesProperty`,
`currentCycleNumberProperty`). The schedule is **entirely derived** — a single internal `DerivedProperty`
recomputes it from the orbital parameters, and the five public Properties above are `TReadOnlyProperty`
views onto that computation, so nothing outside the model can put the schedule out of sync with the
orbits that produced it.

Time-driven animation (`step(dt)`) has three mutually exclusive modes, tracked by a private
`"idle" | "slewing" | "countingDown"` union rather than ad-hoc boolean/sentinel fields:

- **idle** — normal playback; `eventActionProperty` (`RUN`/`PAUSE`/`LOCK`) decides what happens when the
  clock crosses the next scheduled event.
- **slewing** — an eased animation (`slewToEvent`) that jumps the clock to a specific event, used when
  the user clicks an event on the timeline.
- **countingDown** — used by the `PAUSE` event action: play stops at an event for `pauseTimeProperty`
  seconds (tracked by `countdownRemainingProperty`) before automatically resuming.

### TimeModel (common)

`src/common/TimeModel.ts` is a reusable play/pause + elapsed-time model for animated sims. Compose it
into a screen model rather than subclassing:

```typescript
export class YourModel implements TModel {
  public readonly timer = new TimeModel();

  public step(dt: number): void {
    this.timer.step(dt);
    // physics driven by this.timer.timeProperty.value
  }
  public reset(): void { this.timer.reset(); }
}
```

Both `PtolemaicModel` and `ConfigurationsModel` compose a `TimeModel` for `isPlayingProperty` and
`animationRateProperty`, but drive their own `ptolemaicTimeProperty`/`timeProperty` from `step(dt)`
directly (in days and years respectively) rather than using `TimeModel`'s own `timeProperty`.

## View components

### Reactive `ModelViewTransform2`

`ConfigurationsScreenView`'s orbit diagram rescales whenever either semimajor axis changes (so both
orbits stay fit to the diagram). Its `ModelViewTransform2` is exposed as a `TReadOnlyProperty` (a
`DerivedProperty` of the two axis Properties) rather than a plain mutable object — `CelestialBodyNode`
and `ConfigurationsElongationIndicator` each combine that Property with their model-position Property
via `Multilink.multilink`, so they redraw themselves consistently no matter which dependency changed.
`PtolemaicScreenView`'s transform never changes (that screen has no adjustable orbit radius), so it
wraps its static transform in a constant `Property` to satisfy the same interface.

### SolarSystemModelsPanel (common)

`src/common/SolarSystemModelsPanel.ts` wraps SceneryStack's `Panel` with the sim's color scheme baked
in. Both screens' control/display panels use it so projector-mode switching is automatic.

### Color scheme

`SolarSystemModelsColors.ts` defines `ProfileColorProperty` instances for "default" (dark) and
"projector" (light) profiles; SceneryStack switches profiles automatically when the user toggles
Projector Mode in Preferences. The exported `zodiacGhostBarColor(deltaPx)` computes speed-based
ghosting-bar tints for the Ptolemaic zodiac strip (ported from Flash `Zodiac Strip.as`);
`PtolemaicZodiacStrip.updateGhosting()` rebuilds those bars from the path trail's longitude array.

### Configurations event names (i18n)

Synodic event labels use typed keys (`EventNameKey` in `ConfigurationsModel`) rather than
hardcoded English strings. `eventNameLabel()` / `eventNameStringProperty()` in
`src/configurations/view/eventNameLabel.ts` map each key (e.g. `opposition`, `inferiorConjunction`)
to the corresponding `configurations.*` string in locale JSON (`strings_en.json`, `strings_es.json`,
`strings_fr.json`). The timeline, time readout, and screen summary all resolve labels through this helper.

## Multi-screen simulations

See [doc/multi-screen.md](./multi-screen.md) for the general guide this sim's two-screen structure
follows (independent vs. shared-model architectures, per-screen accessibility strings, home-screen icon
requirements). This sim uses the **independent-state** pattern — the two screens share no model — since
the Ptolemaic and Configurations labs are conceptually separate simulators in the original NAAP suite.

## Decompiling the Flash sources

See the root [CLAUDE.md](../CLAUDE.md) for `npm run decompile`, which extracts the original Flash
simulators' ActionScript into `NAAP/decompiled/` (git-ignored) as a read-only reference for diffing the
port's math against the originals.
