# Leap Frogs Balance Baseline

**Recorded:** 2026-09-20
**Purpose:** Establish a repeatable numerical baseline for Gate 6 without treating automated agents as a substitute for human play.

## Method

Run `npm run analyze:balance` while the development server is available. The analyzer completes 40 deterministic ten-frog rounds for each of two deliberately extreme behaviors:

1. **Idle human:** yellow is parked away from the pond, exposing the clockwork rival's unopposed performance.
2. **Exact tracker:** yellow continuously targets the lowest currently catchable frog, approximating mechanically precise trajectory-following.

Seeds 1–40 are identical between runs. The analyzer records catch distributions, misses, round duration, win rate, and launch gaps. It also enforces broad regression bands so accidental changes fail loudly while leaving room for later human-led tuning.

## Recorded results

| Scenario                                | Yellow average | Blue average | Missed average | Duration average | Range notes                         |
| --------------------------------------- | -------------: | -----------: | -------------: | ---------------: | ----------------------------------- |
| Idle human                              |           0.00 |         5.72 |           4.28 |          18.63 s | Blue caught 2–8                     |
| Exact tracker, instant pointer movement |          10.00 |         0.00 |           0.00 |          18.02 s | Every round was a 10–0 sweep        |
| Exact tracker, 900 px/s net glide       |           8.95 |         1.05 |           0.00 |          18.02 s | Yellow caught 6–10; blue caught 0–4 |

Across the idle-human runs, launch gaps averaged **1.81 seconds**, with a **0.82–2.90 second** range. The exact tracker won all 40 glide-limited rounds, so this is a mastery ceiling test rather than a claim that the AI is ready for release.

## Design decision

Instant pointer movement made trajectory-following dominant and eliminated the shared contest: perfect tracking swept every frog in every seed. A generous 900 px/s physical glide preserves direct control but gives movement distance a cost. Under the same seeds, the rival recovered an average of 1.05 frogs and the tracker no longer swept every round.

Keep the glide until human evidence contradicts it. Do not narrow its speed from automated results alone; the next decision must compare real novice and experienced players on mouse and touch.

## Regression bands

- Idle-human blue average: 4.0–7.5 frogs.
- Exact-tracker yellow average: 7.0–9.75 frogs.
- Exact-tracker blue average: at least 0.5 frogs.
- Average round duration: 15–22 seconds.
- Individual launch gaps: 0.7–3.2 seconds.

These bands guard the current playable envelope, not final balance targets.

## Human validation required

For each test, record input type, first- and second-round counts, whether the player chases trajectories or holds territory, perceived cause of misses, and rematch choice.

- Can a first-time player win at least one of two rounds without the clockwork rival appearing to give frogs away?
- Does the glide feel physical and learnable, or merely delayed?
- Does mouse tracking outperform touch because fingers obscure the pond?
- Do players anticipate landing regions by round two instead of only chasing the current frog?
- Do the final two frogs create more attention than the opening two?

Gate 6 remains closed until these simulated predictions are compared with recorded human play.
