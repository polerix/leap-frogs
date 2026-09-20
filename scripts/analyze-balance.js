import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

const rounds = Number(process.env.BALANCE_ROUNDS || 40);
const baseUrl = process.env.TEST_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 980 } });
const idleResults = [];
const trackingResults = [];

async function loadRound(seed) {
  const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}seed=${seed}`;
  await page.goto(url);
  await page.waitForFunction(
    () => !document.querySelector("#start-btn").disabled,
  );
  await page.evaluate(() => window.advanceTime(0));
  await page.click("#start-btn");
}

async function readRound() {
  const state = await page.evaluate(() =>
    JSON.parse(window.render_game_to_text()),
  );
  const events = await page.evaluate(() => window.get_leap_frogs_events());
  assert.equal(state.mode, "over");
  assert.equal(state.conservation, 10);
  assert.equal(state.resolved, 10);
  return { state, events };
}

async function moveYellowAway() {
  const bounds = await page.locator("canvas").boundingBox();
  assert.ok(bounds);
  const scale = Math.min(bounds.width / 1200, bounds.height / 760);
  await page.mouse.move(
    bounds.x + (bounds.width - 1200 * scale) / 2 + 1115 * scale,
    bounds.y + (bounds.height - 760 * scale) / 2 + 150 * scale,
  );
}

for (let index = 0; index < rounds; index++) {
  const seed = index + 1;
  await loadRound(seed);
  await moveYellowAway();
  await page.evaluate(() => window.advanceTime(40000));

  const { state, events } = await readRound();
  assert.equal(state.caughtBy.yellow, 0);

  const launchTimes = events
    .filter((event) => event.type === "frog_launch")
    .map((event) => event.elapsed);
  const launchGaps = launchTimes
    .slice(1)
    .map((time, gapIndex) => Number((time - launchTimes[gapIndex]).toFixed(2)));
  idleResults.push({
    seed,
    duration: state.elapsed,
    yellowCaught: state.caughtBy.yellow,
    blueCaught: state.caughtBy.blue,
    missed: state.missed,
    launchGaps,
  });
}

for (let index = 0; index < rounds; index++) {
  const seed = index + 1;
  await loadRound(seed);
  await page.evaluate(() => {
    for (let frame = 0; frame < 1600; frame++) {
      const state = JSON.parse(window.render_game_to_text());
      if (state.mode === "over") return;
      const frog = state.frogs
        .filter((candidate) => candidate.catchable)
        .sort((a, b) => b.y - a.y)[0];
      if (frog) {
        const canvas = document.querySelector("canvas");
        const bounds = canvas.getBoundingClientRect();
        const scale = Math.min(bounds.width / 1200, bounds.height / 760);
        const offsetX = bounds.left + (bounds.width - 1200 * scale) / 2;
        const offsetY = bounds.top + (bounds.height - 760 * scale) / 2;
        canvas.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            pointerId: 1,
            pointerType: "mouse",
            clientX: offsetX + frog.x * scale,
            clientY: offsetY + frog.y * scale,
          }),
        );
      }
      window.advanceTime(30);
    }
  });

  const { state } = await readRound();
  trackingResults.push({
    seed,
    duration: state.elapsed,
    yellowCaught: state.caughtBy.yellow,
    blueCaught: state.caughtBy.blue,
    missed: state.missed,
    result: state.result,
  });
}

await browser.close();

const values = (results, key) => results.map((result) => result[key]);
const average = (numbers) =>
  numbers.reduce((sum, number) => sum + number, 0) / numbers.length;
const median = (numbers) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};
const distribution = (results, key) => ({
  average: Number(average(values(results, key)).toFixed(2)),
  median: median(values(results, key)),
  min: Math.min(...values(results, key)),
  max: Math.max(...values(results, key)),
});
const allGaps = idleResults.flatMap((result) => result.launchGaps);
const summary = {
  rounds,
  idleHuman: {
    blueCaught: distribution(idleResults, "blueCaught"),
    missed: distribution(idleResults, "missed"),
    durationSeconds: distribution(idleResults, "duration"),
  },
  trackingHuman: {
    yellowCaught: distribution(trackingResults, "yellowCaught"),
    blueCaught: distribution(trackingResults, "blueCaught"),
    missed: distribution(trackingResults, "missed"),
    durationSeconds: distribution(trackingResults, "duration"),
    yellowWinRate: Number(
      (
        trackingResults.filter((result) => result.result === "yellow").length /
        trackingResults.length
      ).toFixed(2),
    ),
  },
  launchGapSeconds: {
    average: Number(average(allGaps).toFixed(2)),
    min: Math.min(...allGaps),
    max: Math.max(...allGaps),
  },
};

// Broad regression bands protect the intended novice-to-mastery envelope without
// pretending that deterministic agents replace human balance testing.
assert.ok(
  summary.idleHuman.blueCaught.average >= 4 &&
    summary.idleHuman.blueCaught.average <= 7.5,
  `Idle-opponent catch average drifted outside 4–7.5: ${summary.idleHuman.blueCaught.average}`,
);
assert.ok(
  summary.trackingHuman.yellowCaught.average >= 7 &&
    summary.trackingHuman.yellowCaught.average <= 9.75,
  `Tracking-player catch average drifted outside 7–9.75: ${summary.trackingHuman.yellowCaught.average}`,
);
assert.ok(
  summary.trackingHuman.blueCaught.average >= 0.5,
  `Tracking reduced the rival below the contest floor: ${summary.trackingHuman.blueCaught.average}`,
);
assert.ok(
  summary.idleHuman.durationSeconds.average >= 15 &&
    summary.idleHuman.durationSeconds.average <= 22,
  `Round duration drifted outside 15–22 seconds: ${summary.idleHuman.durationSeconds.average}`,
);
assert.ok(
  summary.launchGapSeconds.min >= 0.7 && summary.launchGapSeconds.max <= 3.2,
  `Launch gaps drifted outside 0.7–3.2 seconds: ${summary.launchGapSeconds.min}–${summary.launchGapSeconds.max}`,
);

fs.mkdirSync("output/web-game", { recursive: true });
fs.writeFileSync(
  "output/web-game/balance-report.json",
  JSON.stringify(
    { summary, idleRounds: idleResults, trackingRounds: trackingResults },
    null,
    2,
  ),
);
console.log(JSON.stringify(summary, null, 2));
