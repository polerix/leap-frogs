# Game Development Skill Gates

## Purpose

This report distills the Stonetronix game design archive into a practical development framework. The goal is to identify the abilities a designer or team must demonstrate before adding more content, complexity, technology, or production cost.

The archive's central lesson is consistent across lectures, prototypes, rules, spreadsheets, and finished games: game design converts an intended player experience into a clear system, then improves that system through evidence. Ideas, features, and production output matter only when they support that chain.

## Executive summary

The strongest improvement sequence is:

1. Define the player and intended experience.
2. Model the playable structure.
3. Communicate the design so others can execute it.
4. Build the smallest prototype that answers one question.
5. Test with players and revise the underlying system.
6. Quantify balance, difficulty, and pacing.
7. Compare intended behavior with actual player behavior.
8. Integrate the design into real production constraints.

Each stage is a gate. A team should not pass a gate because it discussed the topic or produced a document. It passes when independent people can observe the required behavior and reproduce the result.

## Core takeaways from the archive

### Design starts with player effect

The sources repeatedly separate a design goal from a topic, feature list, or technology choice. A useful goal describes the experience or behavior the game should produce for a specific audience. The target experience becomes the criterion for accepting or rejecting mechanics later.

This is reinforced by the progression used in *Designing Games for Game Designers*: goal, opposition, decisions, rules, and interaction. The complete system exists to move a player from a starting state toward a goal while producing meaningful choices and resistance.

### Mechanics create dynamics, which create experience

The MDA material treats rules and components as inputs, play behavior as the causal middle, and player feeling as the output. Designers work from the desired experience backward, but players encounter the game in the opposite direction. This explains why a rule that sounds correct can still produce the wrong experience in play.

### Documents are models, not paperwork

One-page designs, flowcharts, matrices, rulebooks, and prototypes show different views of the same system. Their value comes from exposing relationships, forcing decisions, and synchronizing the team's mental model. A design that cannot be explained clearly usually has unresolved structure.

### Prototypes answer questions

The paper-prototyping material asks designers to state an intention, choose a scope, specify a purpose, and select a time scale. The prototype should isolate the uncertain relationship between player action and intended experience. Reproducing the entire game wastes time and hides the question.

### Iteration requires evidence and preserved intent

The archive emphasizes complete playthroughs, archived versions, notes, outside testers, and repeated attempts. Testing should identify the system that caused a problem rather than patching its visible symptom. The original experience goal remains the standard for choosing among fixes.

### Balance includes drama and learning

Balance is broader than equal numerical strength. The materials address asymmetric roles, probability, difficulty, downtime, uncertainty, inevitability, climax, and learning curves. A fair game can still feel flat, confusing, or tedious. A dramatic game can be intentionally asymmetric while remaining understandable and credible.

### There is no single average player

The Tomb Raider player-modeling study identified distinct behavior groups using completion time, deaths, causes of death, and help requests. The practical lesson is that aggregate averages conceal different strategies and failure modes. Instrumentation should test whether players use the game's possibilities as intended.

### Constraints are part of the design

The Design Jam and preproduction materials frame design as planning under audience, platform, budget, schedule, staffing, and stakeholder constraints. Strong designers adapt the plan when a constraint changes while protecting the intended player experience.

## The eight skill gates

### Gate 1 Player intent and audience

**Required ability:** Define who the game is for, what players should feel or learn, and what the design will deliberately exclude.

**Evidence of competence**

- A one-sentence experience goal names the audience and desired player effect.
- The team can distinguish the goal from genre, setting, story, platform, and feature list.
- The team can explain why the topic and mechanics fit the goal.
- Non-goals are explicit enough to stop attractive but irrelevant features.

**Gate test:** Give the same concept to two different audiences, such as young children and experienced strategy players. Produce two meaningfully different designs while preserving the underlying intent.

**Common failure signals**

- The pitch begins with lore or technology.
- “Fun,” “engaging,” or “immersive” appears without a more precise effect.
- The team treats a publisher, executive, or store category as the player audience.
- Feature decisions depend on personal preference rather than the experience goal.

**Practice drill:** Change only the goal of an existing simple game and observe how player behavior changes. This mirrors the Goal Cards exercise in the archive.

### Gate 2 Playable system structure

**Required ability:** Represent the game as a system of goals, opposition, decisions, rules, state changes, and interactions.

**Evidence of competence**

- A diagram shows the start state, goal state, obstacles, decision points, and feedback.
- The designer can name the small set of player verbs that drive play.
- Each important resource or state variable has a purpose and a bounded range.
- Choices create different consequences rather than cosmetic variation.
- The rules generate activity without requiring the designer to force a script.

**Gate test:** Explain the core loop in five minutes using a single diagram. A listener should be able to predict what a player does, what changes, and why the next decision matters.

**Common failure signals**

- The system offers interaction without meaningful decisions.
- The goal exists, but opposition does not require adaptation.
- The design contains many objects but few relationships.
- A dominant strategy bypasses the intended experience.
- The designer cannot identify the mechanic that produces a claimed emotion.

**Practice drill:** Reduce a complex game to one manipulable core element, then rebuild depth through relationships rather than additional subsystems.

### Gate 3 Design communication

**Required ability:** Express the design in forms that allow players, designers, engineers, artists, producers, and decision-makers to act consistently.

**Evidence of competence**

- A one-page design communicates one core idea clearly and thoroughly.
- A rulebook lets new players set up and play without coaching.
- Flowcharts show sequence and state. Matrices show repeated relationships. Diagrams show space, time, or dependencies.
- Different stakeholders receive the view they need without receiving contradictory designs.
- The team can trace major decisions and the reason behind them.

**Gate test:** Give the rules and one-page design to people who have not seen the game. They must teach it to another group and produce substantially the same play experience.

**Common failure signals**

- The designer must stand beside the prototype to explain exceptions.
- Documents list features but hide system relationships.
- The wiki contains many fragments with no clear hierarchy.
- Team members describe different core loops or victory conditions.
- Writing the rules exposes unresolved terminology or sequencing.

**Practice drill:** Describe one feature four ways: production timeline, marketing summary, engineering system diagram, and player-facing screen flow.

### Gate 4 Focused prototyping

**Required ability:** Build the cheapest model that answers the most important current question.

**Evidence of competence**

- Every prototype begins with a written question.
- Scope is limited to a single idea, session, full-game loop, or metagame question.
- Purpose is explicit: mechanical simulation, abstraction, emotional engagement, usability, or performance.
- The prototype uses an appropriate time scale.
- The team can state what the prototype cannot validate.

**Gate test:** Produce a playable test within one working day that changes a real design decision. The prototype should omit most planned content and technology.

**Common failure signals**

- The prototype tries to reproduce the entire product.
- Fidelity increases before the design question is answered.
- The team spends time simulating computer functions that do not affect the target decision.
- “Is it fun?” is the only test question.
- The team treats prototype code as production code by default.

**Practice drill:** Convert a familiar digital game into cards, dice, and tokens while preserving one chosen emotion. Identify which actions create that emotion.

### Gate 5 Playtesting and iteration

**Required ability:** Learn from player behavior, identify root causes, and improve the design through controlled iterations.

**Evidence of competence**

- Tests use people outside the design conversation.
- The designer observes before explaining or defending.
- Each build records its hypothesis, rule changes, results, and next decision.
- The team distinguishes a symptom from the mechanic or relationship that caused it.
- Iterations remain comparable because the team changes a limited number of variables.
- The design survives complete games, not only isolated moments.

**Gate test:** Run at least three independent sessions. Produce a revision history that links observed behavior to specific changes and shows whether the intended experience became more reliable.

**Common failure signals**

- The designer teaches the game differently to each group.
- Feedback is collected as feature requests rather than behavioral evidence.
- The team patches every complaint independently.
- Playtests happen only after content production.
- Testing stops when the team receives praise.

**Practice drill:** Archive three versions of the same small game. For each version, write the predicted behavior before the test and compare it with what occurred.

### Gate 6 Balance difficulty and pacing

**Required ability:** Predict and tune outcomes, learning, tension, downtime, and rhythm across multiple time scales.

**Evidence of competence**

- The designer can calculate or simulate odds and expected values for important interactions.
- Asymmetric options have explicit strengths, weaknesses, and counterplay.
- Beginners can make progress while experts continue to discover better play.
- Failure feels attributable to correctable player decisions rather than hidden rules or unreliable controls.
- The game manages uncertainty and inevitability to build toward a climax.
- The designer can diagram second-to-second, minute-to-minute, session, and long-term rhythms.

**Gate test:** Compare a numerical prediction with recorded play. Explain material differences and tune the system without breaking the experience goal.

**Common failure signals**

- Balance means only equal starting values.
- The team tunes by intuition without recording outcomes.
- Randomness hides an otherwise solved system.
- A powerful option has no opportunity cost or counter.
- The endgame becomes a long confirmation of an already-decided result.
- Waiting players have no meaningful activity.

**Practice drill:** Build a small odds model for two asymmetric units, then validate it through repeated play. Separately diagram the game's tension curve and event density.

### Gate 7 Player behavior evidence

**Required ability:** Measure whether real players use the game as intended and recognize distinct player strategies or failure modes.

**Evidence of competence**

- Instrumentation records events tied to the core mechanics and design questions.
- Metrics distinguish progress, failure, choice, time, and help-seeking behavior.
- Analysis compares cohorts or behavior groups instead of relying only on averages.
- Quantitative patterns are checked against observation and player context.
- The team can identify underused, misused, or unexpectedly successful features.

**Gate test:** Define an event schema before implementation, then use test data to identify at least two distinct behavior patterns and one design response for each.

**Common failure signals**

- The team collects everything without a decision it wants to inform.
- Success is measured only through retention or completion.
- Averages obscure new players, experts, cautious players, or speed-focused players.
- The team assumes unexpected behavior is wrong without evaluating its experience value.
- Telemetry replaces direct observation.

**Practice drill:** For one level or encounter, predict likely player types, choose a small set of identifying events, and compare the prediction with observed sessions.

### Gate 8 Production integration

**Required ability:** Preserve design intent while coordinating stakeholders, scope, schedule, technology, staffing, and change.

**Evidence of competence**

- Preproduction identifies the audience, platform, budget, time, people, and decision-makers.
- Pillars and non-goals guide scope decisions.
- Design documents support scheduling and the test plan.
- The designer can revise a plan when one major constraint changes.
- The team separates prototype questions from production commitments.
- The design process has a visible path from ideas to plans, implementation, testing, and release.

**Gate test:** Change one constraint late in a design exercise, such as audience, platform, schedule, or creative direction. The team must revise the plan and explain which parts of the player experience remain protected.

**Common failure signals**

- Ideas go directly to implementation without a design check.
- The team treats added scope as progress.
- Documents describe the game but do not support ownership, scheduling, or testing.
- Stakeholder disagreements surface only after implementation.
- The designer protects a favorite feature instead of the intended experience.

**Practice drill:** Run a Design Jam with separate production, marketing, engineering, and creative constraints. Replace one constraint after the first concept review.

## Assessment rubric

Score each gate from 0 to 3.

| Score | Meaning | Observable standard |
|---|---|---|
| 0 | Unformed | The team cannot name the method or produce evidence. |
| 1 | Explained | The team can describe the concept but needs coaching to apply it. |
| 2 | Demonstrated | The team applies the skill successfully on one project with recorded evidence. |
| 3 | Repeatable | The team applies the skill across projects, teaches it, and improves its own method. |

A gate is open at score 2. A development group should target score 3 for Gates 3, 5, and 8 because communication, iteration, and production integration affect every discipline.

## Recommended improvement program

### First 30 days

- Select one small game already understood by the team.
- Write the audience, intended experience, non-goals, and core player verbs.
- Draw the complete playable system on one page.
- Rewrite the rules until a new group can play without coaching.
- Run two paper prototypes, each with a different explicit question.

**Target:** Open Gates 1 through 4.

### Days 31 to 60

- Run at least six independent playtests across three versions.
- Record predictions before each test and outcomes afterward.
- Build an odds or simulation model for one important interaction.
- Diagram the game's tension and event rhythm at two time scales.
- Remove or redesign one rule that creates effort without meaningful choice.

**Target:** Open Gates 5 and 6.

### Days 61 to 90

- Define a small telemetry schema tied to design questions.
- Compare at least two player behavior groups.
- Conduct a constrained Design Jam using the same core concept.
- Create a production brief with scope, owners, risks, test plan, and decision rights.
- Present the design to people representing creative, engineering, production, and player perspectives.

**Target:** Open Gates 7 and 8.

## Practical operating rules

- Do not add fidelity until the current design question requires it.
- Do not accept a mechanic without naming the player behavior it should cause.
- Do not accept a playtest conclusion without recorded observation.
- Do not balance only by averages.
- Do not allow a design document to exist without a decision or audience.
- Do not protect a feature when it conflicts with the intended experience.
- Keep iterations small enough that the team can explain why the result changed.
- Maintain a library of small personal games. Repeated, low-cost practice develops judgment faster than a single long project.

## Primary archive sources

- [Designing Games for Game Designers](gdc-2012/GDC2012-GamesForDesigners.pptx), especially slides 13-18, 25, 31-32, 42-50, 61-69, and 81-85.
- [Less Game More Design](gdc-2015/librande-gamedesign.pdf), especially pages 5, 10-12, 17, 22, 29-35, and 44-52.
- [Play It on Paper](gdc-2018/PlayItOnPaper-2023.pptx), especially slides 24-30, 64, 75-95.
- [Us vs It MDA in Practice](gdc-2025/Us-vs-It_GDC2025.pptx), especially slides 10-18 and 33-51.
- [One Page Designs](gameconnection-2015/OnePageDesigns.pptx), especially slides 15, 48-73, and 83-102.
- [Design Jam](gdc-2016/GDC2016-DesignJam.pptx), especially slides 6 and 9-16.
- [Preproduction and Design Prep](gameconnection-2015/Preproduction-intro.pptx), especially slides 3-8 and 40-41.
- [Game Rhythms](gdc-2017/GameRhythms-Microtalk.pptx) and its timing diagrams for Pac-Man, sports, music, and Resident Evil 4.
- [15 Games in 15 Years](gdc-2011/GDC2011-15Games.pptx) and [15 More Games in 15 More Years](gdc-2026/15MoreGames-2026.pptx) for audience fit, simplification, iteration, downtime, and personal practice.
- [I Have No Words and I Must Design](nfx/gamedesign/nowords2002.pdf), especially pages 3-10 and 23-25.
- [The Art of Computer Game Design](gamedesign/art_of_computer_game_design.pdf), especially pages 51-62 and 64-74.
- [Player Modeling in Tomb Raider Underworld](nfx/gamedesign/Tomb-Raider-modeling.pdf), especially pages 1, 3, and 6-8.
- [Squoddron Odds](nfx/gamedesign/squoddron-odds.xlsx) for probability tables, matchup analysis, and asymmetric ship comparison.
- [Rules format](<nfx/gamedesign/rule_format.doc>) and [design specification outline](<nfx/gamedesign/Class 13 - Outlines.doc>) for player-facing and internal documentation structure.

## Final conclusion

The archive does not point to a single ideal design process. It supports a repeatable discipline: define the experience, model the system, communicate it, isolate uncertainty, test behavior, tune outcomes, measure real play, and adapt the plan to production constraints.

The most important gate is the transition from opinion to evidence. A team improves when it can show why a rule exists, what behavior it should cause, what players actually did, and how the next change follows from that difference.
