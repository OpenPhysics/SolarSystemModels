import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import SolarSystemModelsNamespace from "../../SolarSystemModelsNamespace.js";

export class PlanetType extends EnumerationValue {
  public static readonly SUPERIOR = new PlanetType();
  public static readonly INFERIOR = new PlanetType();
  public static readonly enumeration = new Enumeration(PlanetType);
}

export type PlanetPresetData = {
  readonly epicycleSize: number;
  readonly eccentricity: number;
  readonly apogeeAngle: number; // degrees
  readonly motionRate: number; // degrees/day
  readonly planetType: PlanetType;
};

// Exact values from AS planetData[] line 168
export const PLANET_PRESETS = {
  venus: {
    epicycleSize: 0.719444,
    eccentricity: 0.020833,
    apogeeAngle: 46.167,
    motionRate: 1.6021,
    planetType: PlanetType.INFERIOR,
  } satisfies PlanetPresetData,
  mars: {
    epicycleSize: 0.658333,
    eccentricity: 0.1,
    apogeeAngle: 106.667,
    motionRate: 0.52406,
    planetType: PlanetType.SUPERIOR,
  } satisfies PlanetPresetData,
  jupiter: {
    epicycleSize: 0.191667,
    eccentricity: 0.045833,
    apogeeAngle: 152.15,
    motionRate: 0.0831224,
    planetType: PlanetType.SUPERIOR,
  } satisfies PlanetPresetData,
  saturn: {
    epicycleSize: 0.108333,
    eccentricity: 0.056944,
    apogeeAngle: 224.167,
    motionRate: 0.0334883,
    planetType: PlanetType.SUPERIOR,
  } satisfies PlanetPresetData,
};

export type PlanetPresetKey = keyof typeof PLANET_PRESETS;

SolarSystemModelsNamespace.register("PlanetType", PlanetType);
