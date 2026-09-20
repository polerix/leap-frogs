# Leap Frogs: Skill-Gate Assessment and Advancement Proposal

> **Superseded for product direction:** After this assessment was written, the official 1979 rules, box photograph, and the product goal of a nostalgic desktop/mobile remake were supplied. Use [Leap Frogs: Nostalgic Remake Gate Proposal](leap-frogs-nostalgic-remake-proposal.md) as the current source of truth. This document remains the pre-reference assessment of the solo arcade prototype.

**Assessment date:** 2026-09-20
**Framework:** [Game Development Skill Gates](stonetronix-documents/game-development-skill-gates-report.md)
**Evidence reviewed:** game code and documentation, current automated browser verification, desktop menu/play/results captures, portrait menu/play captures, and the exposed deterministic game state.

## Executive verdict

Leap Frogs is a polished, reliable **mechanic prototype**, but it is not yet a validated game design. Its technical loop is complete: the game loads, teaches its controls, accepts mouse and touch input, scores catches and streaks, accelerates over a 60-second round, pauses, enters fullscreen, persists a best score, and replays without browser errors. The current verification covers those behaviors end to end.

The next risk is not implementation. It is whether the interaction produces a distinctive, learnable skill curve for real players. The only required verb is moving the basket under a frog. Because the basket can move instantly anywhere in two dimensions, frogs have equal value, and misses have no cost beyond resetting the streak, the optimal behavior is usually to chase the lowest descending frog. There is little prediction, commitment, prioritization, or strategic adaptation.

**Recommendation:** treat the current build as the baseline prototype. Open Gates 1 and 2 before adding modes, progression, more art, or a backend. Then validate comprehension and pacing with outside players before committing to release scope.

## Proposed design intent

The repository does not currently state an audience, desired player effect, or non-goals. The following is a working proposal to test, not a claim about the original intent:

> For casual players age 8+ in one-minute desktop or touch sessions, Leap Frogs should create a readable **spot → predict → intercept → recover** arcade rhythm. A great catch should feel earned through anticipation and positioning; a miss should feel attributable to a late or risky decision rather than unclear motion or imprecise controls.

### Design pillars

1. **Readable flight:** the player can understand where danger and opportunity are coming from.
2. **Committed positioning:** catching one frog changes the feasibility of catching another.
3. **Escalating pressure:** the round moves from learning, to flow, to a short climax.
4. **Instant recovery:** a miss matters, but does not stop a casual player from continuing.

### Non-goals for the next milestone

- Long-term progression, economies, or unlock trees.
- Online leaderboards or accounts.
- Large catalogs of frogs, powers, levels, or cosmetic content.
- Punitive lives or a fail state before the 60-second round ends.
- A second game mode before the core catch decision is validated.

## Gate scorecard

The archive rubric scores each gate from 0 to 3; a gate opens at 2.

| Gate | Score | Current evidence | What prevents passage |
|---|---:|---|---|
| 1. Player intent and audience | 1 | The interface implies a casual, all-ages arcade game. | No explicit audience, desired feeling, accessibility target, or non-goals. “Catch as many as possible” defines activity, not the intended experience. |
| 2. Playable system structure | 1 | Goal, timer, score, spawn pressure, catch/miss states, and feedback form a complete loop. | The interaction has one dominant response and few consequential choices. The game cannot yet explain which mechanic creates mastery beyond cursor tracking. |
| 3. Design communication | 1 | README explains setup, controls, scoring, and verification. The start screen teaches the basic action. | There is no one-page design, system map, tension curve, decision record, or independent teach-back evidence. Touch instructions are absent from the first-run screen. |
| 4. Focused prototyping | 2 | The build isolates the supplied-art catch mechanic and supports deterministic simulation. It proves the assets, input mapping, and basic one-minute loop can work. | Future prototypes still need explicit questions and declared limitations so visual polish does not become evidence of design success. |
| 5. Playtesting and iteration | 1 | Automated tests cover catches, misses, streaks, pause, replay, persistence, fullscreen, and narrow-screen mapping. | These tests prove correctness, not comprehension, tension, delight, fairness, or replay desire. No independent human sessions or hypothesis/change/result log are recorded. |
| 6. Balance, difficulty, and pacing | 1 | Spawn delay falls from 1.3 seconds toward 0.55 seconds; streak rewards rise in five-catch bands; the final ten seconds receive time feedback. | Difficulty mainly increases event volume. Flight physics, catch area, and frog value remain constant. The deterministic seed repeats every round, and no prediction-versus-result model or human score distribution exists. |
| 7. Player behavior evidence | 0 | `render_game_to_text()` exposes useful state for testing. | No event history, session data, cohort comparison, or behavioral questions are defined. A local personal best cannot show how players learn or fail. |
| 8. Production integration | 1 | Production build and end-to-end verification pass; the game has responsive input, local persistence, pause, fullscreen, and a security policy. | Release audience, device targets, accessibility standard, analytics/privacy decision, owners, risks, deployment plan, and launch criteria are not defined. Portrait play is not production-ready. |

**Current total: 8/24. Open gates: Gate 4 only.** This score describes available design evidence, not code quality. Engineering readiness is materially stronger than the design score.

## Highest-impact pain points

### 1. The player skill is reactive tracking, not prediction

The start screen says to “watch the glow,” but the 0.48-second launch warning identifies only the source pad. Once airborne, a frog can be caught anywhere on its descent and the basket can teleport to the pointer. The player therefore gains more by following the current frog than by reading a trajectory or choosing an intercept point.

**Design consequence:** improvement is mostly faster hand-eye response. The intended mastery, if it is anticipation and interception, is not structurally required.

**Test first:** compare the current control with two isolated variants:

- **Catch-band variant:** a frog is catchable only in the lower portion of its arc, making early positioning useful.
- **Glide variant:** the basket has a generous maximum speed and acceleration rather than teleporting, making route choice and commitment matter.

Do not combine both changes in the first test. Measure which one adds readable decisions without making the game feel sluggish.

### 2. Pressure rises, but the rhythm does not meaningfully change

The game launches about 44 frogs in the current deterministic round. The delay between warnings accelerates, but launch type, frog value, gravity, warning language, catch geometry, and player objective remain the same. This creates workload escalation rather than a three-act tension curve.

**Design consequence:** the first successful catch teaches almost everything the round has to reveal. Later play is busier, but not substantially richer.

**Proposal:** after the core positioning test passes, author three observable phases:

- **0–15 seconds — learn:** single launches, generous warning, stable speed.
- **15–45 seconds — flow:** modest overlap and a clearly previewed streak opportunity.
- **45–60 seconds — climax:** short bursts or two simultaneous choices, followed by an emphatic finish.

The phases should change the player's decision, not merely reskin the same launch.

### 3. Scoring rewards mastery without explaining it early enough

A miss resets the streak and a catch earns increasing points in five-catch bands, but the live multiplier message appears only at a streak of five. New players cannot forecast the value of protecting a four-catch streak. The result screen reports totals but provides no performance band or next achievable target.

**Design consequence:** score optimization is difficult to learn from the interface, and replay motivation depends mainly on beating an unexplained personal number.

**Proposal:** show streak progress from the first catch, preview the next bonus threshold, and derive Bronze/Silver/Gold targets only after observing real score distributions. Avoid inventing thresholds from internal perfect-play runs.

### 4. The game has quality assurance, not playtest evidence

The browser suite is strong for a prototype: seven consecutive catches, bonus scoring, misses, pause/resume, audio, fullscreen, round completion, replay, persistence, mobile pointer mapping, and console health all pass. However, the test follows frog coordinates directly. It cannot determine whether a person notices the warning, understands the streak, feels increasing tension, or wants another round.

**Design consequence:** implementation confidence can be mistaken for experience validation.

**Proposal:** keep the automated suite as the regression gate, and add an observation log for independent players. Every design revision should record a hypothesis, the one variable changed, observed behavior, and the decision that follows.

### 5. Portrait play is technically mapped but visually compromised

At a 390 × 844 viewport, the start card is usable, but active play compresses the 1200 × 760 landscape canvas to roughly the top third of the screen. The frogs, warning ring, score, and basket become very small, most of the screen is empty, and the footer still advertises keyboard controls. Correct pointer mapping does not make this a viable touch layout.

**Design consequence:** mobile players face a visibility and precision disadvantage unrelated to the intended skill.

**Proposal:** choose one explicit release policy:

- Build a dedicated portrait composition with a larger playfield and touch-first copy, or
- Declare landscape as required and provide a clear rotate-device interstitial.

The first option is preferable if mobile is a target audience. Do not call portrait supported until a human can read and catch comfortably on a typical phone.

### 6. Accessibility is not yet a designed constraint

The menu buttons are keyboard focusable, but the catch action has no keyboard alternative. Score, time, streak, warnings, and active frogs are drawn only to canvas; the static canvas label does not communicate changing state to assistive technology. Small in-canvas text and motion also have no alternate presentation.

**Proposal:** decide the target standard during Gate 1. At minimum, test arrow-key basket control, a reduced-motion option, a high-visibility warning mode, persistent text instructions for the active input type, and a restrained live-region summary for time, catches, and results.

## Proposal to pass the next gates

### Checkpoint A — Direction and decision gate

**Timebox:** 2–3 working days
**Target:** Open Gates 1 and 2.

**Work**

1. Approve or revise the proposed experience goal, audience, pillars, and non-goals.
2. Draw one system diagram:

   `launch warning → read trajectory → choose intercept → position basket → catch/miss → streak feedback → next, harder choice`

3. Name the intended skill in observable language. Recommended: “predict and route,” not simply “react quickly.”
4. Build two low-cost variants, one change at a time: catch band and basket glide.
5. Run five-minute comparisons with at least four people who did not build the game.

**Pass criteria**

- Testers can describe the goal and intended skill in their own words.
- Testers make at least two visibly different positioning choices in response to overlapping opportunities.
- At least 80% of misses are attributed to a readable player decision, not uncertainty about where or when a catch counts.
- One control model is selected with a recorded reason; the rejected model is archived.

### Checkpoint B — Comprehension and iteration gate

**Timebox:** 1 week
**Target:** Open Gates 3 and 5.

**Work**

1. Create a one-page design containing intent, verbs, loop, scoring, pacing, controls, non-goals, and the current open question.
2. Add a first-launch practice moment or in-play prompt only if observation shows the static menu is insufficient.
3. Conduct six independent sessions across at least three casual and three game-familiar players. Use desktop and touch if both remain in scope.
4. Let players start without coaching. Observe the first round silently, ask them to explain scoring afterward, then watch a second round.
5. Make one controlled revision and repeat with a new group.

**Record per session**

- Time to first intentional basket movement and first catch.
- Catch, miss, and best-streak totals by 15-second segment.
- Whether the player noticed the warning and understood the streak before being told.
- Cause of the first three misses: misread, late choice, motor error, obscured target, or unknown.
- Whether the player immediately chooses replay, and why.

**Pass criteria**

- Five of six players start and complete a round without coaching.
- Five of six can explain how to earn and lose a bonus after one round.
- Median performance or best streak improves on round two.
- The revision log connects observed behavior to a specific system change and its measured result.

### Checkpoint C — Pacing and evidence gate

**Timebox:** 1 week
**Target:** Open Gates 6 and 7.

**Work**

1. Replace the linear spawn ramp with a parameterized three-phase rhythm only after Checkpoint A identifies the core decision.
2. Create a small simulation or spreadsheet predicting launches, overlaps, catch opportunities, maximum streak bands, and expected score ranges.
3. Add a minimal, privacy-conscious event stream. Suggested events:

   - `session_start`: input type, viewport class, returning-player flag.
   - `launch`: elapsed time, frog id, warning duration, start and target regions.
   - `catch` / `miss`: elapsed time, frog id, basket distance, streak before/after, score delta.
   - `pause`, `round_end`, `replay`: time, totals, and replay delay.

4. Gather at least 20 complete rounds and compare first-time versus returning players, mouse versus touch, and low- versus high-catch players. Confirm patterns with observation rather than telemetry alone.

**Pass criteria**

- Predicted launch and score ranges are compared with recorded results, and material differences are explained.
- Catch rate and miss causes change across the intended learn/flow/climax phases without a sudden readability collapse.
- At least two player behavior patterns are identified and lead to different design responses.
- Touch and mouse are tuned separately or one is explicitly removed from the release target.

### Checkpoint D — Release integration gate

**Timebox:** 3–5 working days after design validation
**Target:** Open Gate 8.

**Work**

1. Lock the milestone scope and write a release brief: audience, platforms, supported input, owner, schedule, risks, privacy choice, and rollback plan.
2. Resolve the portrait policy and complete keyboard/accessibility decisions.
3. Extend the existing regression suite to the selected control model, pacing phases, event schema, and release viewport matrix.
4. Test current Chrome, Safari, and Firefox on desktop; test representative iOS and Android devices only if touch remains supported.
5. Define launch criteria and a short post-launch review window.

**Pass criteria**

- Production build and regression suite pass on the declared platform matrix.
- No unresolved critical accessibility, readability, input, or data-privacy issue remains.
- Every launch metric maps to a design decision; no data is collected “just in case.”
- A late constraint change can be absorbed without sacrificing the four design pillars.

## Prioritized backlog

| Priority | Item | Gate advanced | Why now |
|---|---|---|---|
| P0 | Approve the experience goal, audience, pillars, and non-goals | 1 | Every later acceptance criterion depends on this. |
| P0 | Prototype catch-band and basket-glide variants separately | 2, 4 | This tests whether the game can require prediction and commitment. |
| P0 | Run and document six uncoached human sessions | 3, 5 | The largest evidence gap is player behavior, not software correctness. |
| P1 | Make streak progress legible from catch one | 2, 6 | It turns score into a learnable decision. |
| P1 | Author and validate a three-phase 60-second rhythm | 6 | It gives the round a learn/flow/climax shape. |
| P1 | Add the minimal event schema and compare cohorts | 7 | It shows who is learning, struggling, or playing differently. |
| P1 | Choose and implement the portrait policy | 1, 8 | Current touch mapping overstates mobile readiness. |
| P1 | Add keyboard and visibility accommodations | 1, 8 | Accessibility must be a release constraint, not a late patch. |
| P2 | Performance grades based on observed distributions | 6, 7 | Targets need real data first. |
| Defer | Modes, progression, online leaderboard, more content | — | These amplify an unvalidated loop and make iteration more expensive. |

## Recommended next milestone

Call the next milestone **“Interception Proof.”** Its deliverable is not more content. It is a build and evidence packet showing that an unfamiliar player can understand the game, make consequential positioning decisions, improve over a second round, and experience a readable rise in pressure. Once that is demonstrated, the existing technical foundation is strong enough to move efficiently toward a release candidate.
