# Leap Frogs: Nostalgic Remake Gate Proposal

**Product goal:** A nostalgic digital remake of the 1979 Schaper physical game for desktop and mobile play.
**Source material:** The supplied 1979 box photograph, the provided rules summary, and the [Schaper English edition listing](https://boardgamegeek.com/boardgameversion/568668/schaper-english-edition).
**Assessment date:** 2026-09-20

## Source clarification

The supplied box and the written setup disagree about the power mechanism. The box says to **wind up the timer** and explicitly says **no batteries required**. The written rules describe a battery-powered motor and note that manufacturing runs may differ.

For the digital game, the important design truth is the same: a rotating mechanical pond launches frogs unpredictably until its finite load is exhausted. For nostalgic presentation, this proposal treats the photographed 1979 wind-up edition as the primary visual and audio reference: wind the red knob, flip the switch, hear the mechanism tick, and watch it run down.

## Product definition

### Audience

- Adults who remember the physical toy and want to share it with friends, siblings, or children.
- Families and casual players who have no prior knowledge but can understand the game within seconds.
- Desktop and mobile players seeking a short, tactile-feeling party or score-chasing experience.

### Experience goal

> Recreate the anticipation, surprise, frantic scramble, and laughter of ten frogs suddenly popping from a wind-up pond, while adapting the net-catching interaction to feel immediate and fair on a screen.

### Authenticity pillars

1. **Ten frogs, then count:** the round ends because the pond is empty, not because an arbitrary score timer expires.
2. **Sudden mechanical surprise:** launches feel irregular and barely telegraphed, like a toy mechanism rather than a scheduled shooter.
3. **Mid-air catches only:** a missed frog is gone; it cannot be collected from the floor.
4. **Visible physical ritual:** load the pond, wind the center knob, flip the switch, and hear the mechanism run.
5. **Friendly competition:** colored nets compete for a finite shared set, and the most frogs wins.
6. **Readable digital fairness:** players can understand which net caught a frog and why, even when the action becomes chaotic.

### Non-goals for the authenticity milestone

- Endless spawning or a content-heavy campaign.
- Streak multipliers as the main win condition.
- Lives, health, combat, power trees, currencies, or unlock systems.
- Online accounts and global leaderboards.
- Photorealistic physics that make catches inconsistent.
- Exact simulation of the internal toy mechanism when a convincing irregular launch rhythm will create the same player experience.

## What the current build gets right

- The supplied table, platter, crank, basket, and frog art create a strong visual connection to the toy.
- The red, yellow, green, and blue palette reads immediately as a late-1970s toy presentation.
- The rotating pond and airborne frog arcs already express the basic physical spectacle.
- Direct mouse and touch movement makes the net feel immediate.
- Catches occur on the downward, mid-air portion of the arc; missed frogs escape rather than becoming collectible.
- The game has a clean start, pause, result, and replay flow.
- Deterministic time control and text-state output provide an unusually strong testing foundation.
- Current automated verification passes all implemented interactions without browser errors.

## Fidelity gaps and pain points

| Original identity                                         | Current build                                                                         | Design impact                                                                                               | Required response                                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Ten physical frogs are loaded and launched once.          | Nine launch pads are modeled and the game produces roughly 44 launches in 60 seconds. | The pond feels like an endless arcade generator rather than a finite toy.                                   | Model ten visible loaded frogs, launch each once, and end after the tenth resolves.                                   |
| The pond is wound, switched on, and runs down.            | The round begins immediately after a conventional start button.                       | The memorable setup ritual and mechanical anticipation are missing.                                         | Turn the start interaction into load → wind → switch-on, kept brief enough for replay.                                |
| Up to four players scramble simultaneously.               | One player controls one basket.                                                       | The central social dynamic—competition for a scarce shared frog—is absent.                                  | Validate one human versus AI first, then local multiplayer per platform.                                              |
| The winner has the most frogs.                            | Players earn points and escalating streak bonuses against a local best.               | The scoring system changes the goal and rewards uninterrupted solo execution rather than contested catches. | Make frog count the authentic-mode score. Preserve streak scoring only in a separate arcade mode, if retained.        |
| Launches are sudden and mechanically random.              | A bright 0.48-second ring identifies the exact source pad before every launch.        | The warning reduces surprise and turns the toy into a forecast task.                                        | Replace exact warnings with subtle global mechanical cues; test whether any pad-specific tell is needed for fairness. |
| Every frog is a scarce object another player might catch. | All frogs are unlimited, identical score events.                                      | There is no denial, priority, ownership race, or endgame scarcity.                                          | Make each catch remove one of ten visible frogs and award it visibly to a colored net.                                |
| Nets are handheld and compete in shared space.            | The basket can teleport anywhere in two dimensions.                                   | Following a frog is easy for one player and provides no territorial conflict.                               | Test a generous glide speed and player home regions so interception and competition matter without feeling sluggish.  |
| The toy naturally supports tabletop group play.           | Portrait mobile play shrinks the landscape canvas to a small strip.                   | On phones, visibility and precision dominate the intended skill.                                            | Create a portrait composition or require landscape with a clear rotate prompt.                                        |

## Updated gate scorecard

The archive rubric scores each gate from 0 to 3; a gate opens at 2.

| Gate                               | Score | Assessment after receiving the official goal                                                                                                                                                                                 |
| ---------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Player intent and audience      |     2 | The nostalgia goal, physical reference, platforms, audience, intended emotions, authenticity pillars, and non-goals now form a usable decision standard.                                                                     |
| 2. Playable system structure       |     2 | Authentic Table mode now conserves ten frogs across loaded, airborne, caught, and missed states; one human and one AI net contest the shared set; and the round ends by counting catches after the pond empties.             |
| 3. Design communication            |     1 | The README explains the current solo arcade game, not the target remake. This brief closes part of the gap, but player-facing rules and a one-page interaction diagram still need validation.                                |
| 4. Focused prototyping             |     2 | The current build is a strong catch-mechanic and visual-fidelity prototype. It can support small, isolated rule experiments.                                                                                                 |
| 5. Playtesting and iteration       |     1 | Automated behavior is well tested; nostalgia, surprise, competition, fairness, and cross-generational comprehension are not.                                                                                                 |
| 6. Balance, difficulty, and pacing |     1 | An 80-round deterministic baseline now records rival strength, a tracking ceiling, duration, and irregular launch gaps. It drove a physical-glide revision, but no recorded human play yet validates its feel or prediction. |
| 7. Player behavior evidence        |     1 | Core events are instrumented locally and simulated idle-versus-tracking cohorts exposed one dominant behavior. Human cohorts, observation, and a second design response are still missing.                                   |
| 8. Production integration          |     1 | The technical foundation is reliable, but final player count, device/input policy, accessibility target, multiplayer scope, and release matrix remain open.                                                                  |

**Updated total after the local-play and balance baseline: 11/24. Open gates: Gates 1, 2, and 4.** The product intent, playable structure, and focused prototype are demonstrated. Instrumentation and simulation now inform tuning, while human comprehension, human balance evidence, and production integration remain unproven.

## Recommended game structure

### Authentic Table mode

This should be the product-defining mode.

1. Ten frogs are visibly loaded around the pond.
2. The player winds the center knob and flips the switch.
3. The pond rotates and launches each frog once at irregular intervals.
4. Players or AI move colored nets to catch frogs while airborne.
5. A frog belongs to the first valid net that catches it; misses leave play permanently.
6. When the last airborne frog resolves, the pond stops.
7. Frogs are counted in each net and the highest count wins. Ties are celebrated as ties; no artificial tiebreak is required for the first version.

### Solo adaptation

The original game has no natural single-player winner. The lowest-risk digital adaptation is:

- One human net versus one to three lightweight AI nets.
- Difficulty controls AI reaction delay and movement speed, not hidden catch priority.
- The result remains a frog count: `Yellow 4 · Blue 3 · Red 2 · Green 1`.
- A practice option may remove opponents, with the explicit goal “catch as many of the ten as you can.”

This keeps the original scarcity and contest even when only one person is present.

### Multiplayer by platform

**Desktop:** the current build supports one pointer/WASD-controlled yellow net against AI, or a second local blue player on the arrow keys. Three- and four-player support still needs a gamepad or controller study; multiple people sharing one mouse is not viable.

**Mobile:** the current build supports one touch-controlled yellow net against AI in landscape. Local mode assigns right-side touch to yellow and simultaneous left-side touch to blue. This is technically verified, but shared-phone hand occlusion still requires human testing; tablets are the stronger two-player target.

**Deferred:** online multiplayer, phone-as-controller networking, accounts, matchmaking, and global leaderboards. These are production multipliers, not requirements for proving the remake.

## Next-gate proposal

### Gate A — Authenticity vertical slice (implemented)

**Target:** Open Gate 2.
**Timebox:** 3–5 working days.

The smallest complete remake loop is now implemented and covered by deterministic browser verification:

- Change the pond to ten launch positions and ten total frogs.
- Show every loaded, airborne, caught, and missed frog as a conserved object.
- Replace the 60-second end condition with “last frog resolved.”
- Replace points and streaks with caught-frog count in Authentic Table mode.
- Add a brief wind-and-switch start ritual and a mechanical run-down finish.
- Replace the exact launch ring with a subtler clockwork cue.
- Add one AI opponent before attempting local multiplayer.

The technical criteria are satisfied. Recognition, comprehension, and nostalgia criteria move forward into Gate B's independent player sessions.

**Pass criteria**

- At every moment, `loaded + airborne + caught + missed = 10`.
- The game cannot launch an eleventh frog or catch a frog after it hits the floor.
- An unfamiliar player can state why the round ended and who won.
- At least three of four observers identify the build as a digital version of the photographed toy without being shown the title.
- Contested catches have a deterministic, visible resolution rule.

### Gate B — Nostalgia and comprehension test

**Target:** Open Gates 3 and 5.
**Timebox:** 1 week.

Run six uncoached tests in two groups:

- Three adults who remember the toy or similar mechanical action games.
- Three players without prior knowledge, ideally including family or younger casual players in the target range.

Give each tester two rounds. Do not explain the rules unless they become blocked.

**Observe**

- Whether loading, winding, switching on, catching, and counting are understood from the interface.
- Whether exact-pad warnings are missed when removed, or whether sound and motion provide enough readiness.
- Whether catches feel attributable to net placement rather than ambiguous overlap.
- Whether the last two frogs produce more anticipation than the first two.
- Whether players watch the pond, their own net, or the opponent nets.
- Whether they choose an immediate rematch and what they expect to improve.

**Pass criteria**

- Five of six players start and complete a round without coaching.
- Five of six correctly explain that only ten frogs exist and mid-air catches count.
- No tester is uncertain which net won a contested frog.
- The nostalgic group recognizes the wind-up/switch/count ritual as faithful in spirit.
- Median second-round catch count improves or player movement becomes observably more anticipatory.

### Gate C — Ten-frog drama and opponent balance

**Target:** Open Gates 6 and 7.
**Timebox:** 1 week after Gate B.

**Current evidence:** The repeatable 40-seed baseline is recorded in [Leap Frogs Balance Baseline](balance-baseline.md). An exact tracker initially swept all ten frogs in every round. Limiting pointer-controlled nets to a generous 900 px/s glide changed the same cohort to 8.95 yellow and 1.05 blue catches on average, demonstrating that travel distance now matters. Idle-human runs place the current clockwork rival at 5.72 catches, rounds average 18.63 seconds, and launch gaps span 0.82–2.90 seconds. These are regression anchors, not pass evidence; they still need comparison with novice, experienced, mouse, and touch players.

Design the launch rhythm around scarcity rather than elapsed-time spawn acceleration:

- Frogs 1–3 establish the rule with space between launches.
- Frogs 4–7 create overlapping or closely spaced contests.
- Frogs 8–9 increase uncertainty and mechanical urgency.
- Frog 10 receives a longer suspense window, not a predictable fixed delay.

Instrument only events tied to design decisions:

- `round_start`: input type, viewport class, opponent count, AI level.
- `frog_launch`: frog number, elapsed time, source region, cue duration.
- `frog_catch`: frog number, net owner, net distance, contested status.
- `frog_miss`: frog number and miss region.
- `round_end`: counts per net, winner/tie, duration.
- `rematch`: delay from results and any changed settings.

**Pass criteria**

- Launch timings feel irregular but produce no long dead period or unreadable burst.
- Easy AI permits a novice win without visibly giving catches away; hard AI remains beatable through positioning.
- The final frogs create higher observed attention without changing the catch rules.
- At least two player behavior patterns are identified, such as center-camping and trajectory-chasing, with a design response for each.
- Mouse and touch catch distributions are compared rather than assumed equivalent.

### Gate D — Platform and release integration

**Target:** Open Gate 8.
**Timebox:** 3–5 working days after the core loop passes.

- Choose the launch promise: recommended `one human + AI` on desktop and mobile, with local multiplayer labeled experimental until tested.
- Provide a proper landscape mobile layout or a rotate-device interstitial.
- Add keyboard or gamepad control for players who cannot use a pointer, plus reduced-motion and high-visibility cue options.
- Update the README, player rules, and automated verification around the ten-frog conservation rule.
- Test declared browsers and representative mobile devices.
- Decide whether behavioral events remain local during testing or require a consented analytics service for release.

**Pass criteria**

- The ten-frog conservation assertion passes in every automated scenario.
- Start, catch, miss, contested catch, last-frog finish, tie, win, rematch, pause, and input mapping all pass regression tests.
- The active playfield remains readable and comfortably controllable on the smallest supported device.
- The release description clearly distinguishes Authentic Table, solo practice, and any experimental multiplayer support.

## Prioritized implementation backlog

| Priority | Change                                                   | Gate advanced | Rationale                                                                                                                |
| -------- | -------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| P0       | Ten launch positions and conserved frog states           | 2             | This is the defining physical rule.                                                                                      |
| P0       | End after the tenth frog resolves                        | 2             | The empty pond, not a clock, creates the original ending.                                                                |
| P0       | Authentic frog-count scoring                             | 2             | Most frogs wins; streak points belong only in a separate arcade variant.                                                 |
| P0       | Wind → switch → mechanical run-down presentation         | 1, 3          | This carries much of the nostalgia at low systemic cost.                                                                 |
| P0       | One transparent AI opponent                              | 2, 6          | It restores contest for a single player without networking scope.                                                        |
| P1       | Subtle clockwork cue instead of exact pad warning        | 5, 6          | It restores surprise while retaining digital fairness.                                                                   |
| P1       | Contested-catch feedback and colored net inventory       | 2, 3          | Players must always know where each scarce frog went.                                                                    |
| P1       | Landscape mobile composition and touch-first copy        | 8             | Current portrait play is too small.                                                                                      |
| P1       | Six-session nostalgia/comprehension study                | 5             | Fidelity must be judged by players, not feature resemblance alone.                                                       |
| P1       | Ten-frog event schema and launch-rhythm model            | 6, 7          | Evidence should explain anticipation, contest, and replay.                                                               |
| P2       | Third and fourth local players via gamepads/tablet       | 8             | Two-player local control is implemented; validate additional controls before promising the original four-player maximum. |
| Defer    | Online multiplayer, accounts, progression, global scores | —             | These do not prove the nostalgic core and dramatically increase scope.                                                   |

## Recommended next milestone

Name the milestone **“Ten Frogs on the Pond.”** It passes when the build conserves exactly ten frogs, recreates the wind-and-switch ritual, supports one human against a visible opponent, ends by counting catches, and is recognized by players as faithful in spirit to the physical toy.

The existing 60-second streak game does not need to be discarded. Preserve it later as **Arcade Mode** after Authentic Table mode passes its gates. This keeps the polished work already completed while making the 1979 rules—not the adaptation—the product's foundation.
