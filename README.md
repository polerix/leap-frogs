# Leap Frogs

A nostalgic browser remake of the 1979 Schaper wind-up pond game, built with the original project graphics in `images/`.

## How to play

Select **Wind the pond** to wind the center timer and switch on the rotating table. Ten frogs are loaded into the pond and launch once each at irregular intervals.

You control the yellow net. Catch frogs while they are descending through the air; a frog that reaches the floor is gone. The blue net can be a clockwork opponent or a second local player. When the tenth frog has been caught or missed, the pond stops and the net with the most frogs wins.

- **Clockwork rival:** mouse, touch, arrow keys, or WASD move the yellow net.
- **Second player on desktop:** mouse or WASD move yellow; arrow keys move blue.
- **Second player on mobile/tablet:** one touch on the right half moves yellow and a simultaneous touch on the left half moves blue.
- **P or Escape:** pause or resume.
- **F:** enter or leave fullscreen.
- **Sound:** enable the optional mechanical and catch effects.

Phones display a rotate prompt in portrait orientation. Play in landscape so the pond and both nets remain readable.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Add `?seed=17` to use a repeatable launch sequence for debugging; normal rounds and rematches use changing seeds.

## Build and verify

```sh
npm run build
npx playwright install chromium
# With the development server running:
npm run test:game
npm run analyze:balance
```

The browser verification covers the wind-up transition, AI and local competition, single-player pointer and keyboard control, two-player keyboard and simultaneous two-touch control, pause/resume, upward-flight catch rejection, yellow and blue catches, the ten-frog conservation rule, the finite last-frog ending, replay reset, sound, fullscreen, portrait rotate guidance, landscape mobile mapping, and browser-console health.

The game exposes `render_game_to_text()` and `advanceTime(ms)` for deterministic testing. At every testable moment:

```text
loaded + airborne + yellow catches + blue catches + missed = 10
```

Calling `advanceTime` switches that page to manual simulation; reload to restore normal animation timing.

The balance analyzer runs 40 seeded idle-player rounds and 40 seeded exact-tracking rounds. Broad regression bands protect round duration, launch rhythm, clockwork-rival performance, and a non-perfect tracking ceiling. Its method and current results are recorded in [Leap Frogs Balance Baseline](balance-baseline.md); these simulations guide human tests but do not replace them.

`get_leap_frogs_events()` returns the current round's local event history (`round_start`, `frog_launch`, `frog_catch`, `frog_miss`, and `round_end`). Events remain in the page and are not transmitted. The same records are dispatched as `leapfrogs:event` browser events for opt-in test tooling.

## Design direction

The current product and gate plan is documented in [Leap Frogs: Nostalgic Remake Gate Proposal](leap-frogs-nostalgic-remake-proposal.md). The first implementation milestone is **Ten Frogs on the Pond**: preserve the finite physical-object loop, wind-up ritual, mid-air catches, competitive counting, and immediate rematch before expanding multiplayer scope.
