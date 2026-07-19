# Model - Solar System Models

This document describes the model (the underlying physics, math, and behavior) for the simulation,
in terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

This sim ports the NAAP *Solar System Models* lab and has two screens that look at the same historical
question — "why do planets sometimes appear to move backward against the stars?" — from two different
models.

- **Ptolemaic System** reconstructs the Earth-centered (geocentric) explanation: each planet rides a
  small circle (the *epicycle*) whose center travels around a larger circle (the *deferent*) centered
  near, but not exactly on, the Earth. Presets cover Venus, Mars, Jupiter, and Saturn (Mercury has no
  preset). Students can store/recall parameter sets and watch a zodiac longitude trail.
- **Planetary Configurations** shows the Sun-centered (heliocentric) explanation: **planet 1 is always
  the observer** and **planet 2 is always the target**, both on circular orbits. Retrograde motion is
  the geometric effect of one body periodically overtaking the other. A timeline schedules synodic
  events with RUN, PAUSE, or STOP actions at each alignment.

Students can compare the two models directly: the same retrograde behavior an observer sees from Earth
falls out of very different underlying geometries.

## Quantities and units

| Quantity | Symbol | Units | Range |
|---|---|---|---|
| Epicycle size (Ptolemaic) | R_e | deferent radii | 0 – **0.75** |
| Eccentricity (Ptolemaic) | ecc | deferent radii | 0 – **0.2** |
| Motion rate (Ptolemaic) | — | °/day | **0.01 – 4.5** |
| Apogee angle (Ptolemaic) | — | degrees | 0 – 360 |
| Elapsed time (Ptolemaic) | t | days | 0 – ∞ |
| Path trail duration | — | years | 0.3 – 10 |
| Animation rate (Ptolemaic) | — | days per second | 1 – 500 (default 100) |
| Semimajor axis (Configurations) | a₁, a₂ | AU | **0.25 – 10** |
| Orbital period (Configurations) | P | years | derived: *a*^1.5 |
| Elongation | — | degrees, signed (− = East, + = West) | −180 – 180 |
| Elapsed time (Configurations) | t | years | 0 – ∞ |
| Animation rate (Configurations) | — | × inner angular speed | 0 – 6 |

## Governing equations

### Ptolemaic System — deferent, epicycle, and equant

The deferent has a fixed radius (normalized to 1) but is offset from Earth by the eccentricity, along
the apogee direction. The *equant* sits twice as far from Earth as the deferent's center, on the same
line. Motion around the deferent is uniform **as seen from the equant**, not from Earth.

Which angle drives the deferent depends on whether the planet is **superior** (Mars, Jupiter, Saturn) or
**inferior** (Mercury, Venus):

- **Superior planets**: deferent driven by the planet's orbital angle (`anomaly`); epicycle locked to the
  Sun's angle.
- **Inferior planets**: deferent follows the Sun's angle; epicycle follows the planet's orbital angle.

The Sun moves at fixed rate ≈ 2π/365.25 rad/day on a circle of radius **2.25** deferent units (diagram
scale). **Ecliptic longitude** is `atan2(y, x)` of geocentric planet position — retrograde appears as
non-monotonic longitude in the zodiac strip.

### Planetary Configurations — Kepler orbits and synodic events

Both bodies move on circular orbits around the Sun:

```
period = semimajorAxis^1.5    (AU and years)
```

**Elongation** measures the target's apparent position relative to the Sun from the observer's viewpoint.

**Synodic period** (time between repeats of the same configuration):

```
T_syn = 1 / (1/P_inner − 1/P_outer)
```

**Event names** depend on which orbit is inner (*a*₁ &lt; *a*₂ means planet 1 is inner observer):

| Inner observer (*a*₁ &lt; *a*₂) | Outer observer (*a*₁ &gt; *a*₂) |
|---|---|
| 1. Opposition | 1. Inferior conjunction |
| 2. Eastern quadrature | 2. Greatest elongation (W) |
| 3. Conjunction | 3. Superior conjunction |
| 4. Western quadrature | 4. Greatest elongation (E) |

Within each synodic cycle, event times are `[0, t_Q, T_syn/2, T_syn − t_Q]` where
`t_Q = acos(a_inner/a_outer) / ω_syn`. The schedule also depends on starting epoch angles via a
**cycle offset** — events are not functions of semimajor axes alone.

**Playback at events:** RUN (pass through), PAUSE (hold + countdown), STOP (hold indefinitely).

Defaults: *a*₁ = 1 AU, *a*₂ = 2.4 AU.

## Simplifications and assumptions

- All orbits are **circular** — deliberate NAAP simplification.
- Configurations: exactly two bodies + fixed Sun; no mutual perturbations.
- Ptolemaic distances are diagram-normalized, not astronomical scale.
- Presets on Configurations set semimajor axes to named planets' AU values.

## References

- NAAP *Solar System Models* lab: `NAAP/astroUNL/naap/ssm/modeling.html`,
  `NAAP/astroUNL/naap/ssm/naap_ssm_sg.pdf` (student guide).
- Original Flash simulators: *Ptolemaic System Simulator* (`ptolemaic023`) and
  *Planetary Configurations Simulator* (`configurationsSimulator044`).
