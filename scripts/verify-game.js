import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 980 } });
const errors = [];

page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const baseUrl = process.env.TEST_URL || "http://127.0.0.1:5173";
const seededUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}seed=17`;
await page.goto(seededUrl);
await page.waitForFunction(
  () => !document.querySelector("#start-btn").disabled,
);
await page.evaluate(() => window.advanceTime(0));

const state = () =>
  page.evaluate(() => JSON.parse(window.render_game_to_text()));
const events = () => page.evaluate(() => window.get_leap_frogs_events());
const step = (milliseconds) =>
  page.evaluate((duration) => window.advanceTime(duration), milliseconds);

async function move(x, y) {
  const bounds = await page.locator("canvas").boundingBox();
  assert.ok(bounds, "canvas must be visible");
  const scale = Math.min(bounds.width / 1200, bounds.height / 760);
  await page.mouse.move(
    bounds.x + (bounds.width - 1200 * scale) / 2 + x * scale,
    bounds.y + (bounds.height - 760 * scale) / 2 + y * scale,
  );
}

let current = await state();
assert.equal(current.mode, "ready");
assert.equal(current.totalFrogs, 10);
assert.equal(current.loaded, 10);
assert.equal(current.conservation, 10);
await page.screenshot({ path: "output/web-game/menu.png" });

await page.click("#start-btn");
assert.equal((await state()).mode, "winding");
await step(720);
assert.equal((await state()).mode, "winding");
await page.screenshot({ path: "output/web-game/winding.png" });
await step(800);
assert.equal((await state()).mode, "playing");

await move(100, 200);
await step(1200);
assert.equal(Math.round((await state()).baskets.yellow.x), 100);
assert.equal(Math.round((await state()).baskets.yellow.y), 200);

const beforeKeyboard = (await state()).baskets.yellow.x;
await page.keyboard.down("ArrowRight");
await step(250);
await page.keyboard.up("ArrowRight");
assert.ok((await state()).baskets.yellow.x > beforeKeyboard);

await page.keyboard.press("p");
const paused = await state();
assert.equal(paused.mode, "paused");
await step(3000);
assert.deepEqual(await state(), paused);
await page.click("#start-btn");
assert.equal((await state()).mode, "playing");

for (let i = 0; i < 120 && (await state()).frogs.length === 0; i++) {
  await step(25);
}
const ascending = (await state()).frogs.find((frog) => frog.vy < 0);
assert.ok(ascending, "a frog should launch upward");
const caughtBeforeAscent = (await state()).caughtBy.yellow;
await move(ascending.x, ascending.y);
await step(40);
assert.equal(
  (await state()).caughtBy.yellow,
  caughtBeforeAscent,
  "ascending frogs cannot be caught",
);

for (let i = 0; i < 500; i++) {
  const snapshot = await state();
  assert.equal(snapshot.conservation, 10);
  const frog = snapshot.frogs
    .filter((candidate) => candidate.catchable)
    .sort((a, b) => b.y - a.y)[0];
  if (frog) await move(frog.x, frog.y);
  await step(30);
  if ((await state()).caughtBy.yellow >= 1) break;
}
const caught = await state();
assert.ok(caught.caughtBy.yellow >= 1, JSON.stringify(caught));
assert.equal(caught.conservation, 10);
await page.screenshot({ path: "output/web-game/catching.png" });

await move(1115, 150);
await step(1300);
for (let i = 0; i < 600; i++) {
  current = await state();
  assert.equal(current.conservation, 10);
  if (current.mode === "over") break;
  await step(100);
}

const ended = await state();
assert.equal(ended.mode, "over");
assert.equal(ended.launched, 10);
assert.equal(ended.loaded, 0);
assert.equal(ended.airborne, 0);
assert.equal(ended.resolved, 10);
assert.equal(ended.conservation, 10);
assert.equal(ended.caughtBy.yellow + ended.caughtBy.blue + ended.missed, 10);
assert.ok(ended.caughtBy.blue > 0, "the blue opponent should catch frogs");
const endedEvents = await events();
assert.equal(
  endedEvents.filter((event) => event.type === "frog_launch").length,
  10,
);
assert.equal(
  endedEvents.filter((event) =>
    ["frog_catch", "frog_miss"].includes(event.type),
  ).length,
  10,
);
assert.equal(
  endedEvents.filter((event) => event.type === "round_end").length,
  1,
);
await page.screenshot({ path: "output/web-game/results.png" });

await page.click("#sound");
assert.equal(await page.locator("#sound").textContent(), "Sound on");
await page.click("#fullscreen");
await page.waitForFunction(() => !!document.fullscreenElement);
await page.evaluate(() => document.exitFullscreen());

await page.click("#start-btn");
const restarted = await state();
assert.equal(restarted.mode, "winding");
assert.equal(restarted.loaded, 10);
assert.equal(restarted.launched, 0);
assert.equal(restarted.resolved, 0);
assert.equal(restarted.conservation, 10);

await page.setViewportSize({ width: 390, height: 844 });
assert.equal(
  await page
    .locator("#rotate-hint")
    .evaluate((element) => getComputedStyle(element).display),
  "flex",
);
assert.equal(
  await page
    .locator("#stage")
    .evaluate((element) => getComputedStyle(element).display),
  "none",
);
await page.screenshot({ path: "output/web-game/mobile-rotate.png" });

await page.setViewportSize({ width: 844, height: 390 });
assert.notEqual(
  await page
    .locator("#stage")
    .evaluate((element) => getComputedStyle(element).display),
  "none",
);
await step(1600);
await move(600, 450);
await step(700);
assert.equal(Math.round((await state()).baskets.yellow.x), 600);
assert.equal(Math.round((await state()).baskets.yellow.y), 450);
await step(900);
await page.screenshot({ path: "output/web-game/mobile-play.png" });

// A fresh local-multiplayer scenario verifies dual keyboard and two-touch input.
await page.goto(seededUrl);
await page.waitForFunction(
  () => !document.querySelector("#start-btn").disabled,
);
await page.evaluate(() => window.advanceTime(0));
await page.selectOption("#opponent-mode", "local");
assert.match(
  await page.locator("#opponent-rule").textContent(),
  /second touch/i,
);
await page.screenshot({ path: "output/web-game/local-menu.png" });
await page.click("#start-btn");
await step(1600);
assert.equal((await state()).opponent, "local");

const yellowBeforeLocalKeys = (await state()).baskets.yellow.x;
await page.keyboard.down("d");
await step(200);
await page.keyboard.up("d");
assert.ok((await state()).baskets.yellow.x > yellowBeforeLocalKeys);

const blueBeforeLocalKeys = (await state()).baskets.blue.x;
await page.keyboard.down("ArrowRight");
await step(200);
await page.keyboard.up("ArrowRight");
assert.ok((await state()).baskets.blue.x > blueBeforeLocalKeys);

async function touchNet(pointerId, x, y, type = "pointerdown") {
  await page.evaluate(
    ({ pointerId, x, y, type }) => {
      const canvas = document.querySelector("canvas");
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(bounds.width / 1200, bounds.height / 760);
      const offsetX = bounds.left + (bounds.width - 1200 * scale) / 2;
      const offsetY = bounds.top + (bounds.height - 760 * scale) / 2;
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId,
          pointerType: "touch",
          isPrimary: pointerId === 11,
          buttons: type === "pointerup" ? 0 : 1,
          clientX: offsetX + x * scale,
          clientY: offsetY + y * scale,
        }),
      );
    },
    { pointerId, x, y, type },
  );
}

await touchNet(11, 220, 360);
await touchNet(12, 980, 360);
await step(1000);
const touched = await state();
assert.equal(Math.round(touched.baskets.blue.x), 220);
assert.equal(Math.round(touched.baskets.blue.y), 360);
assert.equal(Math.round(touched.baskets.yellow.x), 980);
assert.equal(Math.round(touched.baskets.yellow.y), 360);
await page.screenshot({ path: "output/web-game/local-play.png" });
await touchNet(11, 220, 360, "pointerup");
await touchNet(12, 980, 360, "pointerup");

await step(40000);
const localEnded = await state();
assert.equal(localEnded.mode, "over");
assert.equal(localEnded.opponent, "local");
assert.equal(localEnded.conservation, 10);
assert.equal(localEnded.resolved, 10);
const localEvents = await events();
assert.equal(localEvents[0].type, "round_start");
assert.equal(localEvents[0].opponent, "local");
await page.screenshot({ path: "output/web-game/local-results.png" });

assert.deepEqual(errors, []);
fs.writeFileSync(
  "output/web-game/verification.json",
  JSON.stringify({ passed: true, caught, ended, localEnded, errors }, null, 2),
);
console.log(
  "PASS: ten conserved frogs, wind-up transition, mid-air catches, AI and local competition, two-player keyboard and two-touch controls, local event evidence, pause/resume, finite round end, replay, sound, fullscreen, portrait rotate guidance, landscape mapping; no browser errors.",
);
await browser.close();
