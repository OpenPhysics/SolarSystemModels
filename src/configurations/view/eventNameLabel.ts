import type { ReadOnlyProperty } from "scenerystack/axon";
import { StringManager } from "../../i18n/StringManager.js";
import type { EventNameKey } from "../model/EventNameKey.js";

/** Resolve a synodic event name key to its localized string property. */
export function eventNameStringProperty(key: EventNameKey): ReadOnlyProperty<string> {
  const s = StringManager.getInstance().getConfigurationsStrings();
  switch (key) {
    case "opposition":
      return s.oppositionStringProperty;
    case "quadratureEastern":
      return s.quadratureEasternStringProperty;
    case "conjunction":
      return s.conjunctionStringProperty;
    case "quadratureWestern":
      return s.quadratureWesternStringProperty;
    case "inferiorConjunction":
      return s.inferiorConjunctionStringProperty;
    case "greatestElongationWestern":
      return s.greatestElongationWesternStringProperty;
    case "superiorConjunction":
      return s.superiorConjunctionStringProperty;
    case "greatestElongationEastern":
      return s.greatestElongationEasternStringProperty;
  }
}

/** Current localized label for an event key (or empty string). */
export function eventNameLabel(key: EventNameKey | ""): string {
  return key === "" ? "" : eventNameStringProperty(key).value;
}
