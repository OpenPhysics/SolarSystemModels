# Port NAAP "Solar System Models" Flash sims to SceneryStack

## Context

This repo (`SolarSystemModels`) is a **scaffold-only** two-screen SceneryStack sim. Both
screens currently render only a placeholder label + Reset All — no model/physics. The goal
is to port the two NAAP Flash labs to faithful SceneryStack TypeScript implementations:

- **Ptolemaic System** (`src/ptolemaic/`) — Earth-centered deferent/epicycle/equant model + "view from Earth".
- **Planetary Configurations** (`src/configurations/`) — Sun-centered Keplerian orbits + elongation/configuration analysis + a synodic event timeline.

**The decompiled ActionScript of the original Flash `.swf` files is now available and is the
authoritative source of truth** (`NAAP/decompiled/…`, produced by `npm run decompile`). Transcribe
its math into typed TS. The React ports (`NAAP/Ptolemaic-System-Simulator/`,
`NAAP/planetary-config-react/`) are a useful but **secondary** cross-reference — they simplified or
omitted features the Flash originals have (e.g. the configurations event schedule/timeline, the
Ptolemaic memory/recall). Where they disagree, **the decompiled AS wins.**

Decisions locked with the user:
- **Full parity, phased** — reproduce every feature, built in independently-shippable phases.
- **Pure vector scenery** — render *everything* with scenery primitives (`Circle`/`Path`/`Line`/`Text`/`ArrowNode`). No external image assets. Zodiac = colored band + sign labels; constellations = markers/labels, not figures.

### Authoritative reference files (decompiled AS — read-only; transcribe, do NOT vendor)

All paths under `NAAP/decompiled/`. The package dir is literally named `%3Cdefault package%3E` (URL-encoded `<default package>`).

**Ptolemaic** (`ptolemaic023-C/scripts/`):
| File | Key contents (function → lines) |
|---|---|
| `%3Cdefault package%3E/Ptolemaic System.as` | **Core model.** Constructor/defaults (1–58); `onEnterFrameFunc` time integration (249–260); `update()` equant geometry + Sun/planet/vectors (271–339); `setEccentricity`/`setApogeeAngle` deferent+equant placement (481–516); `setDeferentRadius`/`setDeferentCenter`/`setEquantCenter` drag clamps (358–480); `updatePath` retrograde-trail longitude array (90–211) |
| `frame_1/DoAction.as` | **Controller + preset data.** `planetData[]` preset table (168); `onReset` defaults (1–24); `setPresets` (68–85); slider/checkbox change handlers (108–163); `memoryStore`/`memoryRecall` (25–57) |
| `%3Cdefault package%3E/Zodiac Strip.as` | "View from Earth" strip: `setSunLongitude`/`setPlanetLongitude` longitude→x mapping + ghosting trail (39–184); width 600, factor `600/2π ≈ 95.49296` |
| `%3Cdefault package%3E/New Sun.as` | Sun drag → `setSunAngle` (8–18) |

**Configurations** (`configurationsSimulator044-C/scripts/`):
| File | Key contents (function → lines) |
|---|---|
| `%3Cdefault package%3E/Configurations Simulator.as` | **Core model.** `update()` angles/longitudes/elongation (56–94); `calculateSystemProperties` synodic period + event schedule (591–628); `setSemimajorAxis` Kepler period (563–590); `calculateAnimationRate` (99–102); `setTime`/`setTimeByCycleAndEventNumbers` snap-to-events (235–335); `setTimeByPlanetAngle`/`setEpochAngleByPlanetAngle` drag (336–478); `animateOnEnterFrame`/`slewToEvent`/countdown (107–230) |
| `%3Cdefault package%3E/Orbits Diagram.as` | Sun-centered view: `onSystemPropertiesChanged` orbit scaling (271–300); `onSimulatorUpdated` planet placement + elongation arc/arrows/label (180–270); `drawArc` (125–173); colors (19–25) |
| `%3Cdefault package%3E/Timeline.as` | Scrolling synodic timeline: scale/units (195–289); scrub-drag (95–113); time readout "yr, (yr, days)" (120–190) |
| `%3Cdefault package%3E/Orbits Diagram Planet.as` | Planet drag → `setTimeByPlanetAngle`; **Shift-drag** → `setEpochAngleByPlanetAngle` (14–81) |
| `%3Cdefault package%3E/Zodiac Strip.as` | Config "view from Earth" strip (466 lines) + constellation areas/names |
| `%3Cdefault package%3E/Timeline Event Item.as`, `Timeline Event Cycle.as` | Event markers/labels on the timeline |

Educational background: `NAAP/astroUNL/naap/ssm/modeling.html`, `NAAP/astroUNL/naap/ssm/naap_ssm_sg.pdf`.

---

## Conventions for every phase (read before editing)

These bind all phases. A weaker LLM must follow them literally.

1. **Replicate existing scaffold patterns.** Study `src/ptolemaic/PtolemaicScreen.ts`,
   `model/PtolemaicModel.ts`, `view/PtolemaicScreenView.ts` and their `Configurations*` twins —
   they show exact `Screen<Model,View>` wiring, `implements TModel`, `step(dt)`/`reset()`,
   `screenSummaryContent` in `super()`, the bottom-right `ResetAllButton`, and the `pdomOrder`
   wrapper `Node`. New code mirrors these.
2. **Reactive state only.** All model state is `scenerystack/axon` Properties (`NumberProperty`,
   `BooleanProperty`, `EnumerationProperty`, `DerivedProperty`). Views never compute physics; they
   `.link(...)` to model Properties. `reset()` calls `.reset()` on every Property.
3. **Model–view separation via `ModelViewTransform2`** (`scenerystack/phetcommon`). Models work in
   physical units (normalized "deferent radii" + days for Ptolemaic; AU + years for Configurations).
   **Models use standard math coordinates (y up); the transform flips y for the view.** The Flash AS
   negates `sin`/`_y` everywhere because Flash screen-y points down — do NOT copy those negations
   into the model; let an inverted-Y `ModelViewTransform2` handle it.
4. **No magic numbers.** Layout px → `src/SolarSystemModelsConstants.ts`. Physics constants → new
   constants files (below). Colors → `src/SolarSystemModelsColors.ts` (always BOTH `default` and
   `projector`; seed from the AS hex values where given).
5. **Strings & a11y.** No hard-coded English in views. Every visible string and every
   `accessibleName`/`accessibleHelpText` comes from `StringManager` (add keys to all three locale
   JSONs `src/i18n/strings_{en,fr,es}.json` — the `satisfies` checks in `StringManager.ts` fail the
   build if any locale is missing a key; copying English into fr/es as placeholders is acceptable).
6. **TypeScript is strict** (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
   `noUnusedLocals/Parameters`, `noExplicitAny`, `noConsole`). Use `import type` for type-only
   imports. Local imports use `.js` extensions.
7. **Gate after every phase:** `npm run check && npm run lint && npm run build && npm test`. Run
   `npm run fix` to auto-format.
8. **Verify imports exist** by grepping `node_modules/scenerystack/` before use. Expected paths:
   `scenerystack/scenery` (Node, Circle, Path, Line, Rectangle, Text, RichText, VBox, HBox, AlignBox,
   DragListener), `scenerystack/scenery-phet` (ResetAllButton, TimeControlNode, ArrowNode,
   NumberControl, PhetFont), `scenerystack/sun` (Panel, Checkbox, ComboBox, AquaRadioButtonGroup,
   HSlider, RectangularPushButton), `scenerystack/axon`, `scenerystack/dot` (Vector2, Range, Bounds2,
   Utils, Dimension2), `scenerystack/kite` (Shape), `scenerystack/phetcommon` (ModelViewTransform2),
   `scenerystack/phet-core` (Enumeration, EnumerationValue, optionize).

---

## Physics appendix (transcribed from the decompiled AS — the heart of the port)

> Encode these in normalized model units. Use standard math coords (y up); drop the AS's screen-y
> negations. Choose `daysPerSecond` / `yearsPerSecond` animation-scale constants and tune in verification.

### A. Ptolemaic model (ref `Ptolemaic System.as`)

Normalized fixed constants: deferent radius `R = 1`; **Sun orbit radius = 2.25** (AS: 225px / 100px
deferent — NOT 3 as the React port used); `DAYS_PER_YEAR = 365.24667`.

Adjustable parameters (slider ranges from React `PlanetaryParameters.jsx`, presets are authoritative
from AS `planetData[]` line 168):
- `epicycleSize` `R_e` ∈ [0, 1]
- `eccentricity` `ecc` ∈ [0, 0.5]  (model units; AS multiplies slider by 100 to get px)
- `motionRate` ∈ [0, 4.5]   (degrees/day)
- `apogeeAngle` (deg) ∈ [0, 360]
- `planetType` ∈ {SUPERIOR, INFERIOR}

Exact preset table (`planetData[]`):
| Planet | epicycleSize | ecc | apogee° | motionRate | type |
|---|---|---|---|---|---|
| Venus | 0.719444 | 0.020833 | 46.167 | 1.6021 | inferior |
| Mars | 0.658333 | 0.10 | 106.667 | 0.52406 | superior |
| Jupiter | 0.191667 | 0.045833 | 152.15 | 0.0831224 | superior |
| Saturn | 0.108333 | 0.056944 | 224.167 | 0.0334883 | superior |
Reset selects **Mars** (index 1); also: animationRate slider 100, pathDuration 2.5 yr, showEpicycle &
showDeferent on, all other toggles off.

Time integration (model time in **days**). Maintain `sunAngleProperty`, `anomalyProperty`,
`timeProperty(days)`. Rates (per day): `sunRate = 2π/DAYS_PER_YEAR` (Sun 1 rev/yr);
`anomalyRate = motionRate · π/180`. Per step of `dtDays`:
```
time      += dtDays
anomaly   += anomalyRate · dtDays
sunAngle  += sunRate    · dtDays
```
`dtDays = dt · daysPerSecond · animationRate` (`daysPerSecond` tunable; AS default animationRate 0.1).

Equant geometry (the pedagogical core — AS `update()` 271–339, the clean **asin** form):
```
apogee        = toRadians(apogeeAngle)
deferentCenter = ecc · (cos apogee, sin apogee)          # offset from Earth (origin)
equant         = 2·ecc · (cos apogee, sin apogee)        # twice the offset, collinear
equantAngle    = apogee                                  # = atan2(equant−deferentCenter)
equantDistance = ecc                                     # |equant − deferentCenter|

drive   = (planetType == SUPERIOR) ? anomaly : sunAngle  # which angle drives the deferent
φ       = drive − equantAngle
s       = (equantDistance / R) · sin(π − φ)              # clamp to [−1, 1]
ψ       = φ − asin(s)
θ_def   = equantAngle + ψ                                 # true deferent angle (uniform about equant)
epicycleCenter = deferentCenter + R · (cos θ_def, sin θ_def)

epiDrive = (planetType == SUPERIOR) ? sunAngle : anomaly # epicycle driven by the OTHER angle
planet   = epicycleCenter + R_e · (cos epiDrive, sin epiDrive)

eclipticLongitude = atan2(planet.y, planet.x)            # planet as seen from Earth at origin
sun      = 2.25 · (cos sunAngle, sin sunAngle)
sunLongitude = sunAngle
```
Expose `planetPositionProperty`, `epicycleCenterProperty`, `equantPositionProperty`,
`deferentCenterProperty`, `sunPositionProperty`, `eclipticLongitudeProperty`, `sunLongitudeProperty`
as `DerivedProperty`s. Note the SUPERIOR/INFERIOR swap: superior planets have the deferent driven by
the slow `anomaly` and the epicycle locked to the Sun (`sunAngle`); inferior planets are the reverse.

### B. Configurations model (ref `Configurations Simulator.as`)

Observer = planet **1** (`semimajorAxis1`, default 1.00 AU = Earth); target = planet **2**
(`semimajorAxis2`, default 2.40 AU). Adjustable: `a1`, `a2` ∈ [≈0.25, 10] AU (confirm slider min/max
from frame init); presets Mercury 0.39, Venus 0.72, Earth 1.00, Mars 1.52, Jupiter 5.20, Saturn 9.54.
Time in **years**.

Kepler + position (AS `setSemimajorAxis` 571, `update()` 56–67):
```
period_i = a_i ^ 1.5                                      # years
angle_i  = (epochAngle_i + 2π · time / period_i) mod 2π
pos_i    = a_i · (cos angle_i, sin angle_i)               # Sun at origin
```
Elongation (AS 66–87) — **mind the sign convention**:
```
planetLongitude = atan2(pos2.y − pos1.y, pos2.x − pos1.x) mod 2π    # observer→target
sunLongitude    = atan2(−pos1.y, −pos1.x)            mod 2π          # observer→Sun
deg = ((sunLongitude − planetLongitude)·180/π) mod 360 ; if deg>180: deg −= 360   # (−180,180]
elongationValue = |deg|, made negative iff (deg<0 and deg≠180)       # negative = EAST
label: value<0 → "E"; value>0 and ≠180 → "W"; 0/180 → none
```
Synodic period + named-configuration event schedule (AS `calculateSystemProperties` 591–628):
```
inner = planet with smaller a ; outer = larger a
synodicPeriod = 1 / (1/period_inner − 1/period_outer)
ω_syn   = 2π / synodicPeriod
t_q     = acos(a_inner / a_outer) / ω_syn
eventTimesList = [0, t_q, synodicPeriod/2, synodicPeriod − t_q]
cycleOffset    = ((epochAngle_outer − epochAngle_inner) mod 2π) / ω_syn
eventNames = (observer is inner)
   ? ["opposition", "quadrature (eastern)", "conjunction", "quadrature (western)"]
   : ["inferior conjunction", "greatest elongation (western)", "superior conjunction", "greatest elongation (eastern)"]
```
Absolute event time for cycle `c`, event `e`: `cycleOffset + c·synodicPeriod + eventTimesList[e]`.
Animation rate (AS 99–102): `rate = sliderValue · min(period1, period2) / 2π`; `dtYears = dt · yearsPerSecond · rate`.

Derived Properties to expose: `pos1`, `pos2`, `elongationDeg` (signed), `elongationLabel`,
`synodicPeriod`, `eventTimesList`, `cycleOffset`, `eventNames`, plus `currentConfigurationProperty`
(nearest event name within a tolerance, for readouts/a11y). Orbit scaling (AS `Orbits Diagram` 271–300):
`scale = (viewWidth − 2·orbitMargin)/max(a1,a2)`, `screenRadius_i = scale·a_i/2`.

---

## Phase 1 — Shared foundation (`src/common/`)

- **`src/SolarSystemModelsConstants.ts`** (edit): add `PTOLEMAIC_DEFERENT_RADIUS = 1`,
  `PTOLEMAIC_SUN_RADIUS = 2.25`, `DAYS_PER_YEAR = 365.24667`, `daysPerSecond`/`yearsPerSecond`
  animation scales, AU preset radii, parameter ranges/defaults. Keep `Namespace.register` updated.
- **`src/common/AnimationModel.ts`** (or extend `TimeModel`): existing `TimeModel`
  (`src/common/TimeModel.ts`) has `isPlayingProperty` + `timeProperty` only. Both sims need a
  **continuous animation-rate slider**. Add an `animationRateProperty: NumberProperty`. Keep
  `TimeModel` reusable; document the choice.
- **`src/common/CelestialBodyNode.ts`**: reusable vector body — `Circle` + optional label `Text`,
  positioned via a model `Vector2` Property + `ModelViewTransform2`, accepts `accessibleName`, and an
  optional `DragListener` hook (used by Sun/planet drag). Used for Earth, Sun, planets, markers.
- **Colors** (`src/SolarSystemModelsColors.ts`): add `earthColorProperty`, `sunColorProperty` (AS gold
  `#f5c242`), `planetColorProperty`, `observerPlanetColorProperty` (AS `0x8398BC`),
  `targetPlanetColorProperty` (AS `0x989898`), `orbitColorProperty` (AS `0xC8C8C8`/`13158600`),
  `deferentColorProperty`, `epicycleColorProperty`, `equantColorProperty`, `eccentricColorProperty`,
  `vectorColorProperty` (AS `0xA0A0A0`/`10526880`), `elongationColorProperty`, `zodiacBandColorProperty`
  — each with default + projector.

**Done when:** files compile, gate passes, nothing wired into screens yet.

---

## Phase 2 — Ptolemaic model physics (`src/ptolemaic/model/`)

- **`src/ptolemaic/model/PtolemaicPlanet.ts`** — enum/record of the 4 presets (table A, exact values).
- **`src/ptolemaic/model/PtolemaicModel.ts`** — `implements TModel`. Properties: `epicycleSizeProperty`,
  `eccentricityProperty`, `motionRateProperty`, `apogeeAngleProperty` (deg), `planetTypeProperty`
  (`EnumerationProperty`), composed animation model, `sunAngleProperty`, `anomalyProperty`. Derived per
  appendix A. Methods: `applyPreset(planet)`, `step(dt)`, `setSunAngle(rad)` (for Sun drag),
  `resetTime()`, `reset()` (Mars defaults). Implement the **asin equant** exactly; clamp `s∈[−1,1]`.
- **`src/ptolemaic/model/PtolemaicModel.test.ts`** — assert hand-computed planet position/longitude for
  a known parameter set; verify retrograde (ecliptic longitude non-monotonic) for the **Mars** preset
  over one cycle; verify SUPERIOR vs INFERIOR swap; verify `reset()`/`resetTime()`.

**Done when:** model tests pass, gate passes. No view yet.

---

## Phase 3 — Ptolemaic orbital view + controls (`src/ptolemaic/view/`)

- **`PtolemaicScreenView.ts`** — replace placeholder. `ModelViewTransform2`
  (`createSinglePointScaleInvertedYMapping`) mapping origin → a left-region center, scale so radius ~3
  fits. Vector children, each `.link()`ed to model derived Properties: Earth at origin; Sun
  `CelestialBodyNode` (drag added in Phase 4); planet; deferent circle (`Path` centered at deferent
  center); epicycle circle (centered at epicycle center); equant crosshair (`Path`); eccentric-center
  dot; vector `ArrowNode`s (planet vector to r≈2.5, equant vector, Earth–Sun line, epicycle–planet
  line). 12 zodiac sign labels around the rim (AS constructor 16–35).
- **`PtolemaicControlPanel.ts`** — planet preset `ComboBox` (Venus/Mars/Jupiter/Saturn) →
  `applyPreset`; `NumberControl`s for epicycle size, eccentricity, motion rate, apogee angle;
  planet-type `AquaRadioButtonGroup`; a **"set preset"** button enabled on manual edits (AS
  `setPresetsButton`); **memory store / recall** buttons (AS `memoryStore`/`memoryRecall` 25–57).
- **`PtolemaicDisplayPanel.ts`** — `Checkbox`es: deferent(on), epicycle(on), planet vector(off),
  equant vector(off), Earth–Sun line(off), epicycle–planet line(off) — drive node `visibleProperty`.
- **`PtolemaicTimeControls.ts`** — `TimeControlNode` (play/pause + step `model.step(1/60)`),
  animation-rate slider, path-duration slider (wired in Phase 4), "reset time" button (`resetTime`).
- **`PtolemaicTimeReadout.ts`** — `RichText` years + days (`DAYS_PER_YEAR`).
- Panels right-edge; `ResetAllButton` bottom-right; update `pdomOrder`; `accessibleName` on every
  control from `getPtolemaicA11yStrings()`.

**Done when:** Mars + Play traces epicycle/retrograde loops; sliders/presets/toggles/memory work; gate passes.

---

## Phase 4 — Ptolemaic "view from Earth" + path trail + Sun drag

- **`PtolemaicZodiacStrip.ts`** — vector band (width-600 model, `Rectangle` + 12 sign labels). Sun &
  planet markers positioned by longitude→x: `x = (longitude · width/2π) mod width` (AS
  `setSunLongitude`/`setPlanetLongitude` 39–184). Sun marker uses `−sunAngle` per AS.
- **`PtolemaicPathTrail.ts`** — retrograde geocentric trail. Port AS `updatePath` (90–211) conceptually:
  sample planet position over the last `pathDuration·DAYS_PER_YEAR` days into a capped buffer, render a
  `Path`; fade by segment alpha. Drive buffer length from the path-duration slider; clear on reset/param
  change. (Do NOT replicate Pixi rope interpolation.) Also feed the ghosting trail in the zodiac strip.
- **Sun drag** (AS `New Sun.as`): `DragListener` on the Sun → map pointer angle about Earth to
  `model.setSunAngle`. Keyboard-operable (`tagName:"div"`, `focusable:true`, arrow keys nudge) +
  `accessibleName`. (Optional advanced: deferent-center/equant drag via AS `setDeferentCenter`/
  `setEquantCenter` — mark as stretch.)

**Done when:** strip tracks planet/Sun; trail renders & respects duration; dragging the Sun scrubs both
angles; gate passes.

---

## Phase 5 — Configurations model physics (`src/configurations/model/`)

- **`ConfigurationsPlanet.ts`** — preset radii (Mercury…Saturn, appendix B).
- **`ConfigurationType.ts`** — `Enumeration`: OPPOSITION, CONJUNCTION, INFERIOR_CONJUNCTION,
  SUPERIOR_CONJUNCTION, EASTERN_QUADRATURE, WESTERN_QUADRATURE, GREATEST_EASTERN_ELONGATION,
  GREATEST_WESTERN_ELONGATION, NONE (names mirror AS `eventNamesList`).
- **`ConfigurationsModel.ts`** — Properties: `semimajorAxis1Property`, `semimajorAxis2Property`,
  `epochAngle1Property`, `epochAngle2Property`, composed animation model, `timeProperty(years)`.
  Derived: `period1/2`, `angle1/2`, `pos1/2`, `elongationDegProperty` (signed), `elongationLabelProperty`,
  `synodicPeriodProperty`, `eventTimesListProperty`, `cycleOffsetProperty`, `eventNamesProperty`,
  `currentConfigurationProperty`. Methods: `applyPreset(planetID, planet)`, `setSemimajorAxis(id, a, keepEpoch)`
  (Kepler + epoch preservation, AS 563–590), `step(dt)`, `setTime(t, snap?, threshold?)` /
  `setTimeByCycleAndEvent(c, e)` (snap-to-events, AS 235–335), `setTimeByPlanetAngle` /
  `setEpochAngleByPlanetAngle` (drag, AS 336–478), `resetTime()`, `reset()` (a1=1, a2=2.4).
- **`ConfigurationsModel.test.ts`** — Kepler ratio (Earth ω = 2×… etc.); elongation at known geometry
  (inferior conjunction→0°, opposition→180°, E/W sign); `synodicPeriod`, `t_q`, `eventTimesList`,
  `cycleOffset`; guard `a1==a2`; reset.

**Done when:** model tests pass, gate passes. No view yet.

---

## Phase 6 — Configurations orbital view + controls (`src/configurations/view/`)

- **`ConfigurationsScreenView.ts`** — Sun-centered view. Transform scale from `max(a1,a2)` (AS
  `onSystemPropertiesChanged` 271–300) recomputed when radii change (a `DerivedProperty<ModelViewTransform2>`,
  or recompute view radii on link). Nodes: Sun at origin; two orbit circles (`Path`); observer planet
  (AS blue) + target planet (AS grey) `CelestialBodyNode`s; "observer's planet"/"target planet" labels
  (toggle via "Label orbits").
- **`ConfigurationsControlPanel.ts`** — observer & target each: preset `ComboBox` + `NumberControl`
  (radius AU). Animation-rate slider + `TimeControlNode` (play/pause/step) + "reset time".
- **`ConfigurationsDisplayPanel.ts`** — `Checkbox`es: "Label orbits" (on), "Show elongation angle"
  (off), "Snap to events" (on), "Zoom out to view constellations" (off).
- **`ConfigurationsTimeReadout.ts`** — `RichText` "X years, (Y years, Z days)" (AS Timeline 120–190) +
  synodic period + current configuration name.
- Panels right-edge; Reset All bottom-right; full `pdomOrder`; `accessibleName`s from
  `getConfigurationsA11yStrings()`.

**Done when:** both orbits animate at Keplerian rates, presets/sliders/zoom work, gate passes.

---

## Phase 7 — Configurations elongation, zodiac strip, timeline, events, drag

This phase carries the features the React port lacked. Build incrementally; each bullet is shippable.

- **`ConfigurationsElongationIndicator.ts`** — when "Show elongation angle" on: arrows observer→Sun and
  observer→target (`ArrowNode`), arc between them (`Path`/`Shape.arc`), degrees + E/W label. Port AS
  `Orbits Diagram.onSimulatorUpdated` (180–270) incl. arc direction by sign and arrowhead scaling.
- **`ConfigurationsZodiacStrip.ts`** — vector "view from Earth" band: Sun + target markers by
  longitude→x, large degrees + E/W readout, constellation **labels/markers** (pure-vector). Port config
  `Zodiac Strip.as`.
- **`ConfigurationsTimeline.ts`** — vertical scrolling synodic timeline (AS `Timeline.as`): time axis in
  years with adaptive unit labels, event markers per cycle (names from `eventNames`), center cursor,
  drag-to-scrub time with snap (AS 95–113), selected-event highlight. Bind to model derived Properties.
- **Event actions** — radio group "run / pause / lock" (AS `eventActionGroup`) + pause-duration control
  (AS `pauseTimeSlider`, default 5 s). In the animation step, when `time` crosses `nextEventTime` and
  action≠run, snap to the event and stop; if "pause", run a countdown then resume (AS
  `animateOnEnterFrame` 165–183, `startAnimationCountdown` 107–139). Implement countdown in the
  view/model step using elapsed real time.
- **Slew-to-event** — clicking a timeline event eases time to it over ~650 ms with `1−(1−u)³` (AS
  `slewToEvent`/`slewOnEnterFrame` 197–230).
- **Planet drag** (AS `Orbits Diagram Planet.as`): `DragListener` on each planet → `setTimeByPlanetAngle`;
  **Shift-drag** → `setEpochAngleByPlanetAngle`; pause while dragging; honor snap-to-events; keyboard +
  `accessibleName`.

**Done when:** elongation arc + zodiac strip read correctly; timeline scrubs/snaps; run/pause/lock +
countdown + slew work; dragging a planet (and Shift-drag) updates everything; gate passes.

---

## Phase 8 — Accessibility, i18n, polish, tests

- **i18n:** move every visible string into `strings_en.json` (+ fr/es placeholders): `screens.*`
  (exist), per-screen `a11y.<screen>.controls.*`, a `units`/`labels` group, and the configuration names.
  Keep the `satisfies` key-parity checks green.
- **Live `currentDetails`:** replace the static `a11y.<screen>.currentDetails` usage in
  `PtolemaicScreenSummaryContent.ts` / `ConfigurationsScreenSummaryContent.ts` with a
  `DerivedProperty<string>` over model state (e.g. "Mars near opposition; elongation 176° E"). Pattern:
  pass the model in, build with `PatternStringProperty`/`DerivedProperty`.
- **Keyboard help:** flesh out `PtolemaicKeyboardHelpContent.ts` / `ConfigurationsKeyboardHelpContent.ts`
  (drag, Shift-drag epoch, step, sliders, timeline scrub).
- **Query params / preferences:** add genuinely useful public params to
  `solarSystemModelsQueryParameters.ts` (e.g. initial planet); otherwise leave/repurpose `exampleToggle`.
- **Final tests:** edge cases (ecc 0, motionRate 0, equal radii → synodic period guarded). Full gate.

**Done when:** screen-reader summaries describe live state, strings localized, keyboard help accurate,
full gate green.

---

## Verification (end-to-end)

1. **Static gate (every phase):** `npm run check && npm run lint && npm run build && npm test`.
2. **Unit math:** `npm test` — `PtolemaicModel.test.ts` and `ConfigurationsModel.test.ts` assert the
   transcribed equations against hand-computed values and against the AS formulas (asin equant; synodic
   `eventTimesList`/`cycleOffset`; opposition→180°, inferior conjunction→0°; Mars retrograde).
3. **Manual run:** `npm run dev` → `localhost:5173`; drive with the **`/run`** skill (or Playwright MCP):
   - **Ptolemaic:** Mars + Play shows epicycle retrograde loops; zodiac strip markers + elongation move;
     toggles show/hide; dragging the Sun scrubs time; trail follows & clears on Reset; memory store/recall.
   - **Configurations:** Earth + Mars animate (outer slower); "Show elongation" draws the arc; timeline
     marks opposition/conjunction/quadrature; snap/lock/pause + slew work; dragging a planet (and
     Shift-drag epoch) updates everything; date readout advances.
4. **A11y spot-check:** Tab order matches `pdomOrder`; every control announces a name; `currentDetails`
   updates with state.
5. **Cross-check against the decompiled AS** (authoritative) using the reference table above; the React
   ports are a secondary sanity check only.

## Notes / risks for the implementer

- **Coordinate inversion:** the AS uses Flash screen-y (down). Keep models in math coords and let an
  inverted-Y `ModelViewTransform2` flip — do not copy the `−sin`/`−_y` negations into the model.
- **Sun orbit radius is 2.25 deferent radii** (AS), not 3 (React). Use 2.25.
- **Time units differ per screen:** Ptolemaic integrates in **days** (`sunRate = 2π/365.24667`);
  Configurations integrates in **years** (`period = a^1.5`). Keep the two animation-scale constants
  separate.
- **Elongation sign convention** (Configurations): negative = East, positive = West, per AS — match it
  so the timeline event names line up.
- **Equant asin clamp:** clamp `s = (ecc/R)·sin(π−φ)` to `[−1,1]` before `asin` (AS does).
- **Guard `synodicPeriod`** when `a1 == a2` (AS `setSemimajorAxis` rejects equal axes via a 1e-10 check
  and the sliders nudge apart — replicate, and display ∞/"never" if it ever occurs).
- The **Timeline + event scheduling** (Phase 7) is the largest net-new subsystem vs. the React port;
  budget accordingly and lean on `Configurations Simulator.as` / `Timeline.as` line refs.
