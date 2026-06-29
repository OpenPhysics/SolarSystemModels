# Implementation Notes - Solar System Models

## Architecture Overview

TemplateSingleSim is a minimal starter scaffold for forking new single-screen SceneryStack simulations. It demonstrates the Model-View pattern, color profiles, localization, reset behavior, and reusable common components without domain-specific physics.

### High-Level Architecture

```
main.ts
  └─ SolarSystemModelsScreen             (Screen<SolarSystemModelsModel, SolarSystemModelsScreenView>)
       ├─ SolarSystemModelsModel          state + logic  (src/solar-system-models-screen/model/)
       └─ SolarSystemModelsScreenView     visuals        (src/solar-system-models-screen/view/)
            ├─ SolarSystemModelsScreenSummaryContent     (PDOM overview)
            └─ SolarSystemModelsKeyboardHelpContent      (keyboard help dialog)

src/common/
  ├─ SimPanel.ts           pre-themed panel (all screens share SolarSystemModelsColors)
  └─ TimeModel.ts          composable play/pause + elapsed time

src/preferences/
  ├─ SolarSystemModelsPreferencesModel   sim-specific pref state
  ├─ SolarSystemModelsPreferencesNode    pref UI shown in Preferences → Simulation
  └─ solarSystemModelsQueryParameters    query-parameter declarations
```

Data flows Model → View through AXON `Property` objects. The view observes
properties via `.link()` or `.lazyLink()` and updates reactively.

## Model Components

### SolarSystemModelsModel

An empty coordinator with documented hooks for `step(dt)` and `reset()`.
Add physics state as `BooleanProperty`, `NumberProperty`, etc. from
`scenerystack/axon`.

### TimeModel (common)

`src/common/TimeModel.ts` is a reusable play/pause + elapsed-time model for
animated sims. Compose it into your screen model rather than subclassing:

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

## View Components

### SolarSystemModelsScreenView as Coordinator

The screen view demonstrates layout using `layoutBounds`, background fill from
`SolarSystemModelsColors.ts`, and a `ResetAllButton` wired to `model.reset()`. Add
specialized sub-nodes under `src/solar-system-models-screen/view/`.

### SimPanel (common)

`src/common/SimPanel.ts` wraps SceneryStack's `Panel` with the sim's color
scheme baked in. All control panels should use `SimPanel` so projector-mode
switching is automatic:

```typescript
const panel = new SimPanel(content);            // defaults
const panel = new SimPanel(content, { xMargin: 20 }); // any PanelOption override
```

### Color Scheme

`SolarSystemModelsColors.ts` defines `ProfileColorProperty` instances for "default" (dark)
and "projector" (light) profiles. SceneryStack switches profiles automatically
when the user toggles Projector Mode in Preferences.

## Forking this template

### Automated rename

```sh
npm run rename -- --id friction --name "Friction"
npm run check
```

`scripts/rename-sim.ts` replaces all template identifiers in file content and
renames files and folders in one pass.

### Manual fork checklist

- Update `package.json` name, `init.ts` name/version, `brand.ts`
- Replace placeholder view content with play area and control panels
- Replace `SolarSystemModelsColors.ts` colors with sim-specific palette
- Update locale JSON files: title, screen names, a11y strings
- Regenerate PWA icons (`npm run icons`) after editing `public/icons/icon.svg`
- Add `doc/implementation-notes.md` describing the new sim's architecture

## Multi-screen simulations

See `doc/multi-screen.md` for a complete guide covering:
- Independent vs. shared-model architectures
- File structure for each screen
- StringManager and locale changes
- Home-screen icon requirements
- Per-screen accessibility strings

## Known gaps / TODOs

- No dispose() calls yet — add them once Properties gain external listeners.
- `SolarSystemModelsModel.step()` and `reset()` bodies are stubs — fill in with real physics.
- `SolarSystemModelsScreenView` pdomOrder TODO comment — add interactive nodes as they are created.
