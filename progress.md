## Original arcade prototype

Original prompt: Use graphics in these folders to create a game. The goal of the game is to catch frogs jumping from the turntable with a basket the player controls with a mouse.

Implemented a canvas arcade game using the supplied table, platter, crank, basket and three frog poses. Includes a 60-second round, mouse/touch basket movement, downward-flight catches, launch warnings, accelerating spawn rate, streak bonuses, local best score, pause/replay, optional synthesized sound and fullscreen. Deterministic advanceTime and render_game_to_text hooks added.

Validation pending: build, Playwright interaction bursts, screenshot review, catches/misses/pause/restart/timer and responsive layout checks.

Completed validation:

- Production build passes on Vite 8.2.2; compatible dependency fixes leave npm audit with zero vulnerabilities.
- Skill action client run and screenshots inspected after gameplay/visual changes; no console error artifacts.
- scripts/verify-game.js passes against both development and production servers: actual mouse movement, seven consecutive catches (80 points), streak reset on misses, pause freeze/resume, sound toggle, asynchronous fullscreen entry/exit, 60-second round end, replay reset, persisted best and narrow-screen pointer mapping.
- Inspected menu, active play, catch feedback, results and mobile screenshots. Corrected pad alignment, kept jump apex below scoreboard, fixed 1:00 time formatting, fitted desktop layout to viewport, and removed mobile play letterboxing.
- README includes play, build and test instructions. Only the seven used assets are bundled. Screenshots/test output are ignored by Git.
- Production preview is running at http://127.0.0.1:4173/; development server at http://127.0.0.1:5173/.

At that prototype stage, the automated acceptance work was complete. The later official-rules and nostalgic-remake sections below supersede its product scope and outstanding-work assessment.

## Skill-gate assessment — 2026-09-20

- Applied the eight Stonetronix game-development gates to the current game and wrote `leap-frogs-gate-assessment.md`.
- Re-ran the current end-to-end browser verification: all mouse mapping, catch/streak, miss, pause/resume, sound, fullscreen, round-end, replay, persistence, mobile mapping, and console checks pass.
- Re-inspected desktop menu/play/results and portrait menu/play captures.
- Current evidence score is 8/24; focused prototyping is open, while the next work is to define player intent, create a meaningful interception decision, and validate it with uncoached human playtests.
- Highest-priority issues: instant two-dimensional basket movement makes frog-following dominant; difficulty increases volume more than decision variety; streak mastery is explained late; no human playtest or behavioral evidence exists; portrait play is too small; accessibility and release targets are undefined.
- Proposed next milestone: **Interception Proof**, progressing through direction/decision, comprehension/iteration, pacing/evidence, and release-integration checkpoints before adding new modes or progression.

## Official 1979 rules and product goal — 2026-09-20

- User supplied the 1979 Schaper box photograph, official rule summary, and product goal: a nostalgic remake for desktop and mobile.
- Added `leap-frogs-nostalgic-remake-proposal.md`; it supersedes the earlier generic gate proposal for product direction.
- Source discrepancy recorded: the supplied box says to wind the timer and explicitly says no batteries are required, while the written setup describes battery-powered variants. The photographed wind-up edition is the nostalgia reference.
- Updated Gate 1 to 2/3 because the audience, intended emotions, authenticity pillars, and non-goals are now defined. Overall evidence score is 9/24; Gates 1 and 4 are open.
- Current fidelity gaps: nine modeled pads instead of ten frogs, roughly 44 launches in a timed round, solo play, streak-point scoring, exact launch warnings, no load/wind/switch ritual, and no count-the-frogs ending.
- Proposed next milestone: **Ten Frogs on the Pond**—conserve exactly ten frogs, implement the wind-and-switch ritual, add one visible opponent, end by frog count, and validate nostalgic recognition before expanding multiplayer scope.
- Preserve the existing 60-second streak game as a potential later Arcade Mode rather than discarding it.

## Ten Frogs on the Pond implementation — 2026-09-20

- Replaced the timed endless-spawn prototype with Authentic Table mode: exactly ten conserved frogs, each launched once at an irregular interval, with the round ending only after the last airborne frog resolves.
- Added a visible wind-up sequence, accelerating center crank, automatic switch-on beat, subtle whole-pond mechanical click cue, and run-down finish.
- Added a blue computer-controlled net. Yellow and blue compete for the same airborne frogs; the closer valid net wins a contested catch deterministically.
- Replaced score and streak totals with visible yellow/blue frog counts. Caught frogs accumulate visibly inside each net; missed frogs leave play permanently.
- Aligned nine launch positions with the supplied platter artwork and added a tenth physical launch position.
- Added keyboard movement with arrow keys or WASD alongside direct mouse/touch control.
- Added a portrait rotate-device screen and enlarged the playfield for short landscape phone viewports.
- Expanded `render_game_to_text()` with loaded, airborne, launched, caught-by-net, missed, resolved, conservation, opponent, cue, and result state.
- Rewrote the browser verification around the authentic rules. It proves the conservation invariant, rejects upward-flight catches, exercises both control schemes and the AI opponent, completes a finite round, verifies replay reset and mobile orientation behavior, and reports no browser errors.
- Production build passes. Fresh menu, winding, catch, result, portrait guidance, and landscape play screenshots were visually inspected.
- Updated README with the authentic rules, controls, seeded debugging, mobile policy, and current verification scope.
- Updated the gate proposal to score playable system structure at 2/3. Current evidence score is 10/24, with Gates 1, 2, and 4 open.
- Added restrained screen-reader announcements for wind-up, launches, catches, misses, and final counts.
- Added a local-only event stream for `round_start`, `frog_launch`, `frog_catch`, `frog_miss`, and `round_end`; no data is transmitted. Browser verification proves ten launch events, ten resolution events, and one round-end event.
- Active rounds now pause automatically when a phone turns to portrait, preventing unseen launches behind the rotate guidance.
- Rebuilt, reran the required short interaction client, reran the complete browser suite, and visually re-inspected all six current captures after these changes. All checks pass with no browser errors.

Remaining gate work:

- Human nostalgia/comprehension testing is still required before Gates 3 and 5 can open.
- AI difficulty, ten-launch dramatic rhythm, and behavioral event evidence remain Gate 6/7 work.
- Added a Blue Net selector with clockwork-rival and second-player modes.
- Local desktop play supports yellow via pointer/WASD and blue via arrow keys. Local mobile/tablet play assigns right-side touch to yellow and simultaneous left-side touch to blue.
- The selected opponent mode is recorded in text state and round-start evidence. Yellow/blue/tie result language adapts to human-versus-human play.
- Extended browser verification with a separate local-match scenario covering selector copy, independent keyboard movement, simultaneous touch ownership, complete ten-frog resolution, and local winner presentation.
- Visual QA found the new setup card clipped on short landscape screens; compact landscape-specific typography and spacing now keep the complete title, rules, selector, and start action visible.
- Three- and four-player support remains unimplemented; the two-player phone layout also needs hand-occlusion testing with real players.

## Balance baseline and physical glide — 2026-09-20

- Added `scripts/analyze-balance.js` and `npm run analyze:balance`, covering 40 deterministic seeds each for an idle human and an exact trajectory-tracking human.
- The first recorded baseline exposed a solved interaction: instantaneous pointer movement let the exact tracker catch all ten frogs in all 40 rounds while the rival caught none.
- Added a generous 900 px/s physical glide for pointer- and touch-controlled nets. Keyboard movement remains immediate at its existing speed and updates the same target state.
- With the same 40 seeds, the glide-limited exact tracker averaged 8.95 yellow catches and 1.05 blue catches, with yellow ranging from 6–10 and blue from 0–4. Yellow still won every round, so this is a mastery ceiling rather than release-ready difficulty evidence.
- The idle-human baseline remained 5.72 blue catches and 4.28 misses. Average round duration was 18.63 seconds; launch gaps averaged 1.81 seconds and ranged from 0.82–2.90 seconds.
- Added broad analyzer regression bands for rival performance, tracking dominance, round duration, and launch rhythm. Detailed method, results, decision, and human-test questions are recorded in `balance-baseline.md`.
- Rebuilt, reran the required interaction client, and passed the expanded AI/local browser suite after the glide change. Re-inspected active AI play, local play, and local result captures; no clipping, illegible state, or browser errors were found.
- Gate 6 remains closed: simulated outcomes now provide a numerical prediction, but the archive rubric requires comparison with recorded human play before balance and pacing are demonstrated.
