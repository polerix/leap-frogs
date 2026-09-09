import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 980 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto(process.env.TEST_URL || "http://127.0.0.1:5173");
await page.waitForFunction(
  () => !document.querySelector("#start-btn").disabled,
);
await page.evaluate(() => window.advanceTime(0));
const state = () =>
  page.evaluate(() => JSON.parse(window.render_game_to_text()));
const step = (ms) => page.evaluate((ms) => window.advanceTime(ms), ms);
async function move(x, y) {
  const r = await page.locator("canvas").boundingBox();
  const s = Math.min(r.width / 1200, r.height / 760);
  await page.mouse.move(
    r.x + (r.width - 1200 * s) / 2 + x * s,
    r.y + (r.height - 760 * s) / 2 + y * s,
  );
}
await page.screenshot({ path: "output/web-game/menu.png" });
await page.click("#start-btn");
assert.equal((await state()).time, 60);
await move(100, 200);
assert.equal(Math.round((await state()).basket.x), 100);
await page.keyboard.press("p");
let paused = await state();
await step(3000);
assert.deepEqual(await state(), paused);
await page.click("#start-btn");
assert.equal((await state()).mode, "playing");
// Follow descending frogs with real mouse events, without modifying game state.
for (let i = 0; i < 400; i++) {
  const s = await state();
  const f = s.frogs.filter((f) => f.vy > 0).sort((a, b) => b.y - a.y)[0];
  if (f) await move(f.x, f.y);
  await step(50);
  if ((await state()).caught >= 7) break;
}
let caught = await state();
assert.ok(caught.caught >= 7, JSON.stringify(caught));
assert.ok(caught.score > caught.caught * 10, "streak bonus");
await page.screenshot({ path: "output/web-game/catching.png" });
await move(85, 145);
await step(9000);
assert.ok((await state()).missed > 0);
assert.equal((await state()).streak, 0);
await page.click("#sound");
assert.equal(await page.locator("#sound").textContent(), "Sound on");
await page.click("#fullscreen");
await page.waitForFunction(() => !!document.fullscreenElement);
await page.evaluate(() => document.exitFullscreen());
await step(60000);
let ended = await state();
assert.equal(ended.mode, "over");
assert.equal(ended.time, 0);
assert.equal(ended.best, ended.score);
await page.screenshot({ path: "output/web-game/results.png" });
await page.click("#start-btn");
let restarted = await state();
assert.equal(restarted.caught, 0);
assert.equal(restarted.score, 0);
assert.equal(restarted.time, 60);
assert.equal(restarted.frogs.length, 0);
await page.reload();
await page.waitForFunction(
  () => !document.querySelector("#start-btn").disabled,
);
assert.equal((await state()).best, ended.score);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "output/web-game/mobile-menu.png" });
await page.click("#start-btn");
await page.evaluate(() => window.advanceTime(0));
await move(600, 450);
assert.equal(Math.round((await state()).basket.x), 600);
assert.equal(Math.round((await state()).basket.y), 450);
await step(2100);
await page.screenshot({ path: "output/web-game/mobile-play.png" });
assert.deepEqual(errors, []);
fs.writeFileSync(
  "output/web-game/verification.json",
  JSON.stringify({ passed: true, caught, ended, errors }, null, 2),
);
console.log(
  "PASS: mouse mapping, catches, streak bonuses, misses, pause/resume, sound toggle, fullscreen, round end, replay, saved best, mobile mapping; no browser errors.",
);
await browser.close();
