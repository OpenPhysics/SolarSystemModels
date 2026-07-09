/**
 * Stable keys for synodic configuration event names.
 * Views resolve these via StringManager.getConfigurationsStrings().
 */
export type OuterObserverEventNameKey = "opposition" | "quadratureEastern" | "conjunction" | "quadratureWestern";

export type InnerObserverEventNameKey =
  | "inferiorConjunction"
  | "greatestElongationWestern"
  | "superiorConjunction"
  | "greatestElongationEastern";

export type EventNameKey = OuterObserverEventNameKey | InnerObserverEventNameKey;

export const OUTER_OBSERVER_EVENT_KEYS: readonly OuterObserverEventNameKey[] = [
  "opposition",
  "quadratureEastern",
  "conjunction",
  "quadratureWestern",
];

export const INNER_OBSERVER_EVENT_KEYS: readonly InnerObserverEventNameKey[] = [
  "inferiorConjunction",
  "greatestElongationWestern",
  "superiorConjunction",
  "greatestElongationEastern",
];
