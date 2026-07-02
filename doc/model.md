# Model - Solar System Models

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

This sim ports the NAAP *Solar System Models* lab and has two screens that look at the same historical
question — "why do planets sometimes appear to move backward against the stars?" — from two different
models.

- **Ptolemaic System** reconstructs the Earth-centered (geocentric) explanation: each planet rides a
  small circle (the *epicycle*) whose center travels around a larger circle (the *deferent*) centered
  near, but not exactly on, the Earth. This combination of circles-on-circles reproduces retrograde
  motion without needing a Sun-centered system.
- **Planetary Configurations** shows the Sun-centered (heliocentric) explanation: both bodies orbit the
  Sun on simple ellipses (circular in this sim), and retrograde motion is just the geometric effect of
  Earth periodically overtaking (or being overtaken by) a slower or faster planet. This screen also
  identifies and schedules the recurring alignments — opposition, conjunction, greatest elongation —
  that Earth and the other planet form as they orbit.

Students can compare the two models directly: the same retrograde behavior an observer sees from Earth
falls out of very different underlying geometries.

## Quantities and units

| Quantity | Symbol | Units | Range |
|---|---|---|---|
| Epicycle size (Ptolemaic) | R_e | deferent radii | 0 – 1 |
| Eccentricity (Ptolemaic) | ecc | deferent radii | 0 – 0.5 |
| Motion rate (Ptolemaic) | — | °/day | 0 – 4.5 |
| Apogee angle (Ptolemaic) | — | degrees | 0 – 360 |
| Elapsed time (Ptolemaic) | t | days | 0 – ∞ |
| Semimajor axis (Configurations) | a₁, a₂ | astronomical units (AU) | 0.1 – 15 |
| Orbital period (Configurations) | P | years | derived from a (Kepler) |
| Elongation | — | degrees, signed (− = East, + = West) | −180 – 180 |
| Elapsed time (Configurations) | t | years | 0 – ∞ |

## Governing equations

### Ptolemaic System — deferent, epicycle, and equant

The deferent has a fixed radius (normalized to 1) but is offset from Earth by the eccentricity, along
the apogee direction:

```
deferentCenter = eccentricity · (cos apogeeAngle, sin apogeeAngle)
```

The *equant* is the historical device that keeps the deferent's motion uniform even though it is
off-center from Earth: it sits twice as far from Earth as the deferent's center, on the same line.
Motion around the deferent is uniform **as seen from the equant**, not from Earth or from the deferent's
own center — this is what let Ptolemy's model match observations without needing an off-center Earth to
also be off-center in its rotation.

Which angle drives the deferent depends on whether the planet is superior (Mars, Jupiter, Saturn) or
inferior (Mercury, Venus) relative to Earth's orbit:

- **Superior planets**: the deferent (the "slow" circle) is driven by the planet's own orbital angle
  (`anomaly`), and the epicycle (the "fast" circle) is locked to the Sun's angle.
- **Inferior planets**: it's reversed — the deferent follows the Sun's angle, and the epicycle follows
  the planet's own orbital angle.

This swap is what produces retrograde motion at the right cadence for each class of planet: once per
epicycle revolution, the planet's position as seen from Earth briefly reverses direction along the
zodiac.

### Planetary Configurations — Kepler orbits and synodic events

Both bodies move on circular orbits around the Sun. Kepler's third law ties each orbit's period to its
radius (in AU and years, the constant of proportionality is 1):

```
period = semimajorAxis^1.5
```

An observer on one planet (typically Earth) sees the other planet's apparent position relative to the
Sun — its *elongation* — cycle through recognizable configurations as the two planets' angular
positions drift in and out of alignment. Which configurations are geometrically possible depends on
which orbit is smaller:

- If the **observer's** orbit is the inner one, the target planet can reach **opposition** (directly
  opposite the Sun in the sky) and **conjunction** (behind the Sun), with two quadratures in between.
- If the **observer's** orbit is the outer one, the target planet (now moving faster than the observer)
  passes through **inferior conjunction** (between Earth and the Sun) and **superior conjunction**
  (behind the Sun), with two greatest-elongation events in between.

The time between repeats of the same configuration is the **synodic period** — how long it takes the
faster planet to "lap" the slower one as seen from the Sun. It depends only on the two orbital periods,
not on where either planet currently is:

```
synodicPeriod = 1 / (1/innerPeriod − 1/outerPeriod)
```

Within each synodic cycle, the four named events recur at fixed offsets from a reference time, so the
whole schedule can be predicted and displayed on a timeline rather than only observed as time passes.

## Simplifications and assumptions

- All orbits (Ptolemaic deferents and epicycles, and Configurations orbits) are **circular**, not
  elliptical — a deliberate simplification shared with the original NAAP labs, since eccentricity's
  effect on apparent motion is already the pedagogical point of the *equant*, not orbital ellipticity.
- The Configurations screen models exactly two bodies (an observer and a target) orbiting a fixed Sun;
  it does not model mutual gravitational perturbation between planets.
- Distances and angles are normalized model quantities (deferent radii for Ptolemaic geometry, AU for
  Configurations), not literal solar-system scale — the Ptolemaic Sun-orbit radius, for instance, is
  chosen for a legible diagram, not astronomical accuracy.

## References

- NAAP *Solar System Models* lab: `NAAP/astroUNL/naap/ssm/modeling.html`,
  `NAAP/astroUNL/naap/ssm/naap_ssm_sg.pdf` (student guide).
- Original Flash simulators this sim ports: *Ptolemaic System Simulator* (`ptolemaic.swf`) and
  *Planetary Configurations Simulator* (`configurationsSimulator.swf`).
