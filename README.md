# Leap Frogs

A mouse-controlled arcade game built with the original graphics in `images/`.

## Play locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, then select **Let’s catch frogs**.
Move the mouse to place the basket opening under descending frogs. No clicking is required to catch. Each round lasts 60 seconds; missed frogs reset your streak. Catches earn 10 points, with another 5 points per catch after every five consecutive catches, up to 30. Your best score is saved in this browser.

- **P / Escape**: pause or resume
- **F**: fullscreen
- **Sound**: enable optional sound effects
- Touch/drag also moves the basket on touchscreens.

## Build and verify

```sh
npm run build
npx playwright install chromium
# With the dev server running:
npm run test:game
```

The browser test covers mouse movement, catches, streak scoring, misses, pause/resume, sound toggle, fullscreen, round completion, replay, persisted scores and narrow-screen pointer mapping. Screenshots and state snapshots are saved under `output/web-game/` (ignored by Git). Set `TEST_URL` to test a different local server.

`node scripts/game-client.js --url http://127.0.0.1:5173 --click-selector '#start-btn' --actions-json '{"steps":[{"buttons":[],"frames":120}]}' --iterations 1` runs the web-game skill's action/screenshot client.

The game exposes `render_game_to_text()` and `advanceTime(ms)` for deterministic testing. Calling `advanceTime` switches that page to manual simulation; reload to restore normal animation timing.
