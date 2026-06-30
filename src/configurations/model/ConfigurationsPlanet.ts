import SolarSystemModelsNamespace from "../../SolarSystemModelsNamespace.js";

export type PlanetPresetKey = "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn";

export const PLANET_PRESETS: Record<PlanetPresetKey, number> = {
  mercury: 0.39,
  venus: 0.72,
  earth: 1.0,
  mars: 1.52,
  jupiter: 5.2,
  saturn: 9.54,
};

export const PRESET_KEYS: readonly PlanetPresetKey[] = ["mercury", "venus", "earth", "mars", "jupiter", "saturn"];

SolarSystemModelsNamespace.register("ConfigurationsPlanet", { PLANET_PRESETS, PRESET_KEYS });
