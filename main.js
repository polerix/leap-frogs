const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const stage = document.querySelector("#stage");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start-btn");
const pauseButton = document.querySelector("#pause");
const instructions = document.querySelector("#instructions");
const setupOptions = document.querySelector("#setup-options");
const opponentSelect = document.querySelector("#opponent-mode");
const opponentRule = document.querySelector("#opponent-rule");
const liveStatus = document.querySelector("#live-status");
const portraitPhone = matchMedia(
  "(max-width: 650px) and (orientation: portrait)",
);

const W = 1200;
const H = 760;
const CX = 600;
const CY = 395;
const SIZE = 458;
const TOTAL_FROGS = 10;
const GRAVITY = 650;
const CATCH_X = 64;
const CATCH_Y = 33;
const PLAYER_GLIDE_SPEED = 900;

const assetPaths = {
  table: new URL("./images/table-outline.png", import.meta.url).href,
  platter: new URL("./images/rotating-table.png", import.meta.url).href,
  crank: new URL("./images/crank.png", import.meta.url).href,
  basket: new URL("./images/basket-sprite.png", import.meta.url).href,
  frog1: new URL("./images/frog-sprite-1.png", import.meta.url).href,
  frog2: new URL("./images/frog-sprite-2.png", import.meta.url).href,
  frog3: new URL("./images/frog-sprite-3.png", import.meta.url).href,
};
const assets = {};

const pads = [
  [-45, -159],
  [103, -179],
  [-107, -64],
  [106, -64],
  [-206, -2],
  [158, 43],
  [-116, 116],
  [0, 123],
  [103, 180],
  [198, -22],
];

const querySeed = Number(new URLSearchParams(location.search).get("seed"));
let roundSeed =
  Number.isFinite(querySeed) && querySeed > 0
    ? querySeed >>> 0
    : crypto.getRandomValues(new Uint32Array(1))[0];
let seed = roundSeed;
let state;
let muted = true;
let audio;
let manual = false;
let last = 0;
const keys = new Set();
const pointerOwners = new Map();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function shuffledPads() {
  const order = Array.from({ length: TOTAL_FROGS }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function reset(mode = "ready", advanceSeed = false) {
  if (advanceSeed) roundSeed = (roundSeed + 0x9e3779b9) >>> 0;
  seed = roundSeed || 17;
  state = {
    mode,
    elapsed: 0,
    windTime: 0,
    rotation: 0,
    nextLaunch: 0.7,
    launched: 0,
    launchOrder: shuffledPads(),
    frogs: [],
    ledger: pads.map((_, id) => ({ id: id + 1, pad: id, status: "loaded" })),
    caughtBy: { yellow: 0, blue: 0 },
    missed: 0,
    baskets: {
      yellow: {
        x: 930,
        y: 500,
        targetX: 930,
        targetY: 500,
        homeX: 930,
        homeY: 500,
      },
      blue: {
        x: 270,
        y: 500,
        targetX: 270,
        targetY: 500,
        homeX: 270,
        homeY: 500,
      },
    },
    particles: [],
    lastResult: null,
    events: [],
    opponent: opponentSelect.value,
  };
}

reset();

function announce(message) {
  liveStatus.textContent = "";
  requestAnimationFrame(() => {
    liveStatus.textContent = message;
  });
}

function recordEvent(type, details = {}) {
  const event = {
    type,
    elapsed: +state.elapsed.toFixed(2),
    ...details,
  };
  state.events.push(event);
  window.dispatchEvent(new CustomEvent("leapfrogs:event", { detail: event }));
}

function tone(frequency, duration = 0.12, type = "sine", volume = 0.07) {
  if (muted) return;
  try {
    audio ||= new AudioContext();
    audio.resume();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(40, frequency * 0.62),
      audio.currentTime + duration,
    );
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  } catch {}
}

function padPosition(index) {
  const [x, y] = pads[index];
  const scale = SIZE / 522;
  const cos = Math.cos(state.rotation);
  const sin = Math.sin(state.rotation);
  return {
    x: CX + (x * cos - y * sin) * scale,
    y: CY + (x * sin + y * cos) * scale,
  };
}

function nextLaunchDelay(launched) {
  if (launched < 3) return 1.9 + random() * 0.8;
  if (launched < 7) return 1.15 + random() * 1.15;
  if (launched < 9) return 0.8 + random() * 0.8;
  return 2.15 + random() * 0.75;
}

function launchNextFrog() {
  if (state.launched >= TOTAL_FROGS) return;
  const pad = state.launchOrder[state.launched];
  const record = state.ledger.find((item) => item.pad === pad);
  const start = padPosition(pad);
  const targetX = 125 + random() * 950;
  const vy = -Math.sqrt(
    2 * GRAVITY * Math.min(245, Math.max(70, start.y - 135)),
  );
  const duration =
    (-vy + Math.sqrt(vy * vy + 2 * GRAVITY * (725 - start.y))) / GRAVITY;
  const vx = (targetX - start.x) / duration;

  record.status = "airborne";
  state.frogs.push({
    id: record.id,
    pad,
    x: start.x,
    y: start.y,
    vx,
    vy,
    targetX,
    age: 0,
    aiDelay: 0.48 + random() * 0.34,
    trail: [],
  });
  state.launched += 1;
  state.nextLaunch = nextLaunchDelay(state.launched);
  recordEvent("frog_launch", {
    frog: record.id,
    sequence: state.launched,
    pad,
    loadedRemaining: TOTAL_FROGS - state.launched,
  });
  announce(
    `Frog ${state.launched} launched. ${TOTAL_FROGS - state.launched} remain on the pond.`,
  );
  tone(350, 0.09, "triangle");
}

function burst(x, y, label, color) {
  state.particles.push({ x, y, label, color, life: 1 });
}

function distanceToBasket(frog, basket) {
  return (
    Math.pow((frog.x - basket.x) / CATCH_X, 2) +
    Math.pow((frog.y - basket.y) / CATCH_Y, 2)
  );
}

function settleFrog(frog, status, owner = null) {
  frog.done = true;
  const record = state.ledger.find((item) => item.id === frog.id);
  record.status = status;
  record.owner = owner;

  if (status === "caught") {
    state.caughtBy[owner] += 1;
    const isPlayer = owner === "yellow";
    burst(
      frog.x,
      frog.y,
      isPlayer ? "YOURS!" : "BLUE!",
      isPlayer ? "#ffe44f" : "#72d7ff",
    );
    tone(isPlayer ? 690 : 470, 0.16, isPlayer ? "sine" : "triangle");
    recordEvent("frog_catch", {
      frog: frog.id,
      owner,
      yellow: state.caughtBy.yellow,
      blue: state.caughtBy.blue,
    });
    announce(
      `${isPlayer ? "Yellow" : "Blue"} caught a frog. Yellow ${state.caughtBy.yellow}, Blue ${state.caughtBy.blue}.`,
    );
  } else {
    state.missed += 1;
    burst(clamp(frog.x, 70, W - 70), H - 42, "MISSED", "#9bd9d0");
    tone(180, 0.13, "sine", 0.045);
    recordEvent("frog_miss", { frog: frog.id, missed: state.missed });
    announce(`Frog missed. ${state.missed} missed so far.`);
  }
}

function finish() {
  if (state.mode === "over") return;
  state.mode = "over";
  state.particles = [];
  pauseButton.disabled = true;
  const yellow = state.caughtBy.yellow;
  const blue = state.caughtBy.blue;
  const result = yellow === blue ? "tie" : yellow > blue ? "yellow" : "blue";
  state.lastResult = result;
  recordEvent("round_end", {
    yellow,
    blue,
    missed: state.missed,
    result,
  });
  const title =
    result === "tie"
      ? "It's a<br><em>tie!</em>"
      : result === "yellow"
        ? state.opponent === "local"
          ? "Yellow net<br><em>wins!</em>"
          : "You<br><em>win!</em>"
        : "Blue net<br><em>wins.</em>";
  showOverlay({
    eyebrow: "THE POND IS EMPTY",
    title,
    description: `Yellow net: ${yellow} · Blue net: ${blue}<br>${state.missed} frog${state.missed === 1 ? "" : "s"} escaped`,
    button: "Wind again",
    hint: "Ten frogs. One more round?",
  });
  announce(
    `The pond is empty. Yellow caught ${yellow}. Blue caught ${blue}. ${state.missed} escaped. ${result === "tie" ? "The round is a tie." : `${result === "yellow" ? "Yellow" : "Blue"} wins.`}`,
  );
  tone(
    result === "yellow" ? 760 : result === "tie" ? 560 : 330,
    0.32,
    "triangle",
  );
}

function moveToward(basket, targetX, targetY, speed, dt) {
  const dx = targetX - basket.x;
  const dy = targetY - basket.y;
  const distance = Math.hypot(dx, dy);
  if (!distance) return;
  const amount = Math.min(distance, speed * dt);
  basket.x += (dx / distance) * amount;
  basket.y += (dy / distance) * amount;
}

function updateBasketFromKeys(basket, bindings, dt) {
  let dx = 0;
  let dy = 0;
  if (bindings.left.some((key) => keys.has(key))) dx -= 1;
  if (bindings.right.some((key) => keys.has(key))) dx += 1;
  if (bindings.up.some((key) => keys.has(key))) dy -= 1;
  if (bindings.down.some((key) => keys.has(key))) dy += 1;
  if (!dx && !dy) return;
  const length = Math.hypot(dx, dy);
  basket.x = clamp(basket.x + (dx / length) * 560 * dt, 85, W - 85);
  basket.y = clamp(basket.y + (dy / length) * 560 * dt, 150, H - 118);
  basket.targetX = basket.x;
  basket.targetY = basket.y;
}

function updatePlayerKeys(dt) {
  const yellowBindings = {
    left: state.opponent === "ai" ? ["a", "arrowleft"] : ["a"],
    right: state.opponent === "ai" ? ["d", "arrowright"] : ["d"],
    up: state.opponent === "ai" ? ["w", "arrowup"] : ["w"],
    down: state.opponent === "ai" ? ["s", "arrowdown"] : ["s"],
  };
  updateBasketFromKeys(state.baskets.yellow, yellowBindings, dt);
  if (state.opponent === "local") {
    updateBasketFromKeys(
      state.baskets.blue,
      {
        left: ["arrowleft"],
        right: ["arrowright"],
        up: ["arrowup"],
        down: ["arrowdown"],
      },
      dt,
    );
  }
}

function updateBlueNet(dt) {
  const basket = state.baskets.blue;
  const target = state.frogs
    .filter((frog) => frog.age >= frog.aiDelay && !frog.done)
    .sort((a, b) => b.y - a.y)[0];
  if (target) {
    moveToward(basket, target.x, clamp(target.y, 155, H - 118), 410, dt);
  } else {
    moveToward(basket, basket.homeX, basket.homeY, 180, dt);
  }
  basket.x = clamp(basket.x, 85, W - 85);
  basket.y = clamp(basket.y, 150, H - 118);
}

function updatePointerNets(dt) {
  moveToward(
    state.baskets.yellow,
    state.baskets.yellow.targetX,
    state.baskets.yellow.targetY,
    PLAYER_GLIDE_SPEED,
    dt,
  );
  if (state.opponent === "local") {
    moveToward(
      state.baskets.blue,
      state.baskets.blue.targetX,
      state.baskets.blue.targetY,
      PLAYER_GLIDE_SPEED,
      dt,
    );
  }
}

function update(dt) {
  if (state.mode === "winding") {
    state.windTime += dt;
    state.rotation -= dt * (3.5 + state.windTime * 5);
    updatePointerNets(dt);
    if (state.windTime >= 1.45) {
      state.mode = "playing";
      state.elapsed = 0;
      state.nextLaunch = 0.7;
      pauseButton.disabled = false;
      tone(520, 0.15, "square", 0.045);
      announce("The pond is on. Get ready for ten frogs.");
      if (portraitPhone.matches) pause();
    }
    return;
  }
  if (state.mode !== "playing") return;

  state.elapsed += dt;
  state.rotation +=
    dt * (0.42 + Math.max(0, TOTAL_FROGS - state.launched) * 0.008);
  updatePlayerKeys(dt);
  updatePointerNets(dt);
  if (state.opponent === "ai") updateBlueNet(dt);

  if (state.launched < TOTAL_FROGS) {
    state.nextLaunch -= dt;
    if (state.nextLaunch <= 0) launchNextFrog();
  }

  for (const frog of state.frogs) {
    frog.age += dt;
    frog.trail.unshift({ x: frog.x, y: frog.y });
    if (frog.trail.length > 12) frog.trail.pop();
    frog.x += frog.vx * dt;
    frog.vy += GRAVITY * dt;
    frog.y += frog.vy * dt;

    if (frog.vy > 0 && frog.age > 0.35) {
      const yellowDistance = distanceToBasket(frog, state.baskets.yellow);
      const blueDistance = distanceToBasket(frog, state.baskets.blue);
      if (yellowDistance < 1 || blueDistance < 1) {
        const owner = yellowDistance <= blueDistance ? "yellow" : "blue";
        settleFrog(frog, "caught", owner);
        continue;
      }
    }

    if (frog.y > H + 45 || frog.x < -70 || frog.x > W + 70) {
      settleFrog(frog, "missed");
    }
  }

  state.frogs = state.frogs.filter((frog) => !frog.done);
  for (const particle of state.particles) {
    particle.life -= dt;
    particle.y -= dt * 42;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);

  if (state.launched === TOTAL_FROGS && state.frogs.length === 0) finish();
}

function text(
  value,
  x,
  y,
  size = 16,
  color = "#fff9df",
  align = "left",
  weight = 700,
) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Arial`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function ellipse(x, y, radiusX, radiusY, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
}

function picture(key, x, y, width, angle = 0, filter = "none") {
  const image = assets[key];
  if (!image) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.filter = filter;
  ctx.drawImage(
    image,
    -width / 2,
    (-width * image.height) / image.width / 2,
    width,
    (width * image.height) / image.width,
  );
  ctx.restore();
}

function drawBasket(owner) {
  const basket = state.baskets[owner];
  const player = owner === "yellow";
  ellipse(basket.x, basket.y + 103, 76, 13, "#001b343a");
  const frogOffsets = [
    [-28, 24],
    [0, 16],
    [28, 24],
    [-17, 43],
    [17, 43],
    [-39, 48],
    [39, 48],
    [0, 60],
    [-24, 66],
    [24, 66],
  ];
  for (let index = 0; index < state.caughtBy[owner]; index++) {
    const [offsetX, offsetY] = frogOffsets[index];
    picture("frog1", basket.x + offsetX, basket.y + offsetY, 27);
  }
  picture(
    "basket",
    basket.x,
    basket.y + 39,
    168,
    0,
    player ? "none" : "hue-rotate(145deg) saturate(1.25) brightness(1.05)",
  );
  ctx.strokeStyle = player ? "#fff5bcaa" : "#9de8ffaa";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(basket.x - 7, basket.y);
  ctx.lineTo(basket.x + 7, basket.y);
  ctx.moveTo(basket.x, basket.y - 7);
  ctx.lineTo(basket.x, basket.y + 7);
  ctx.stroke();
  text(
    player ? "YELLOW" : state.opponent === "local" ? "PLAYER 2" : "BLUE AI",
    basket.x,
    basket.y + 126,
    10,
    player ? "#ffe44f" : "#8de4ff",
    "center",
    800,
  );
}

function drawLedger() {
  const startX = W / 2 - 117;
  state.ledger.forEach((record, index) => {
    const x = startX + index * 26;
    const color =
      record.status === "loaded"
        ? "#76d88d"
        : record.status === "airborne"
          ? "#fff9df"
          : record.status === "missed"
            ? "#31586b"
            : record.owner === "yellow"
              ? "#ffe44f"
              : "#71d9ff";
    ellipse(x, 98, 7, 7, color);
    if (record.status !== "loaded") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, 98, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function render() {
  ctx.clearRect(0, 0, W, H);
  const background = ctx.createLinearGradient(0, 0, 0, H);
  background.addColorStop(0, "#164d61");
  background.addColorStop(1, "#082e49");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, W, H);
  for (let y = 24; y < H; y += 32) {
    for (let x = 24; x < W; x += 32) ellipse(x, y, 1, 1, "#ffffff0c");
  }

  ellipse(CX, CY + 70, 390, 265, "#051e3630");
  ctx.strokeStyle = "#7da89922";
  ctx.lineWidth = 1;
  [310, 340, 370].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(CX, CY, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  text("YELLOW NET", 40, 42, 11, "#d8c76c");
  text(String(state.caughtBy.yellow).padStart(2, "0"), 40, 82, 38, "#ffe44f");
  text("FROGS ON THE POND", W / 2, 39, 10, "#a6c8ce", "center");
  text(
    String(
      state.ledger.filter((record) => record.status === "loaded").length,
    ).padStart(2, "0"),
    W / 2,
    76,
    34,
    "#fff9df",
    "center",
  );
  text("BLUE NET", W - 40, 42, 11, "#8eddf5", "right");
  text(
    String(state.caughtBy.blue).padStart(2, "0"),
    W - 40,
    82,
    38,
    "#71d9ff",
    "right",
  );
  drawLedger();

  ctx.save();
  ctx.shadowColor = "#00162680";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 20;
  picture("table", CX, CY, 550);
  ctx.restore();
  ellipse(CX, CY, SIZE / 2, SIZE / 2, "#00623b");
  picture("platter", CX, CY, SIZE, state.rotation);

  state.ledger.forEach((record) => {
    const position = padPosition(record.pad);
    ellipse(position.x, position.y, 29, 29, "#005431");
    ellipse(position.x, position.y, 25, 25, "#007943");
    if (record.status !== "loaded") return;
    const rattle = state.mode === "playing" && state.nextLaunch < 0.3;
    const jitter = rattle
      ? Math.sin(state.nextLaunch * 110 + record.id) * 2
      : 0;
    picture("frog1", position.x + jitter, position.y, 37);
  });

  const crankJitter =
    state.mode === "playing" && state.nextLaunch < 0.3
      ? Math.sin(state.nextLaunch * 150) * 0.08
      : 0;
  picture("crank", CX, CY, 123, -state.rotation * 1.8 + crankJitter);

  for (const frog of state.frogs) {
    frog.trail.forEach((position, index) => {
      if (index % 3 === 0) {
        ellipse(
          position.x,
          position.y,
          8 - index * 0.45,
          8 - index * 0.45,
          `rgba(255,237,120,${0.12 * (1 - index / 12)})`,
        );
      }
    });
    ellipse(frog.x, Math.min(730, frog.y + 70), 23, 7, "#00182725");
    picture(
      frog.vy < -80 ? "frog1" : frog.vy < 100 ? "frog2" : "frog3",
      frog.x,
      frog.y,
      66 + Math.sin(Math.min(1, frog.age / 1.9) * Math.PI) * 14,
      frog.vx * 0.0007,
    );
  }

  drawBasket("blue");
  drawBasket("yellow");

  for (const particle of state.particles) {
    ctx.globalAlpha = particle.life;
    text(particle.label, particle.x, particle.y, 27, particle.color, "center");
    ctx.globalAlpha = 1;
  }

  if (state.mode === "winding") {
    const label = state.windTime < 1.02 ? "WINDING THE TIMER…" : "SWITCH ON!";
    text(
      label,
      W / 2,
      713,
      14,
      state.windTime < 1.02 ? "#ffe44f" : "#a9edb8",
      "center",
      900,
    );
  } else if (state.mode === "playing" && state.nextLaunch < 0.3) {
    text("CLICK…", W / 2, 713, 12, "#ffe9a3", "center", 800);
  } else {
    text("CATCH THEM IN MID-AIR", W / 2, 713, 12, "#a6c8ce", "center");
  }
  text(`${state.missed} missed`, W - 40, 713, 12, "#7da6b6", "right", 400);
}

function showOverlay({
  eyebrow,
  title,
  description,
  button,
  hint,
  showInstructions = false,
}) {
  document.querySelector("#eyebrow").textContent = eyebrow;
  document.querySelector("#title").innerHTML = title;
  document.querySelector("#description").innerHTML = description;
  instructions.hidden = !showInstructions;
  instructions.style.display = showInstructions ? "grid" : "none";
  setupOptions.hidden = !showInstructions;
  setupOptions.style.display = showInstructions ? "flex" : "none";
  document.querySelector("#hint").textContent = hint;
  startButton.textContent = button;
  overlay.hidden = false;
  stage.classList.remove("playing");
  stage.classList.add("paused");
  pauseButton.textContent = "Pause";
}

function showReadyOverlay() {
  updateOpponentCopy();
  showOverlay({
    eyebrow: "SCHAPER 1979 · TABLE MODE",
    title: "Wind it.<br><em>Catch them!</em>",
    description:
      "Ten frogs. Two nets. Most catches wins.<br>Just like the tabletop original.",
    button: "Wind the pond →",
    hint: "Wind-up play · no batteries required",
    showInstructions: true,
  });
  pauseButton.disabled = true;
}

function start() {
  if (state.mode === "paused") {
    state.mode = "playing";
    overlay.hidden = true;
    stage.classList.remove("paused");
    stage.classList.add("playing");
    pauseButton.disabled = false;
    pauseButton.textContent = "Pause";
  } else {
    reset("winding", true);
    recordEvent("round_start", { seed: roundSeed, opponent: state.opponent });
    overlay.hidden = true;
    stage.classList.remove("paused");
    stage.classList.add("playing");
    pauseButton.disabled = true;
    announce("Winding the timer.");
    tone(230, 0.18, "square", 0.04);
  }
  last = performance.now();
}

function pause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    showOverlay({
      eyebrow: "THE TIMER IS PAUSED",
      title: "Hold the<br><em>pond.</em>",
      description: `Yellow ${state.caughtBy.yellow} · Blue ${state.caughtBy.blue}<br>${TOTAL_FROGS - state.launched} frogs are still loaded.`,
      button: "Switch it back on",
      hint: "Press P or Escape to resume.",
    });
    pauseButton.disabled = false;
    pauseButton.textContent = "Resume";
  } else if (state.mode === "paused") {
    start();
  }
}

function pointerPosition(event) {
  const bounds = canvas.getBoundingClientRect();
  const scale = Math.min(bounds.width / W, bounds.height / H);
  const offsetX = bounds.left + (bounds.width - W * scale) / 2;
  const offsetY = bounds.top + (bounds.height - H * scale) / 2;
  return {
    x: clamp((event.clientX - offsetX) / scale, 85, W - 85),
    y: clamp((event.clientY - offsetY) / scale, 150, H - 118),
  };
}

function movePointer(event, owner = "yellow") {
  if (!state?.baskets?.[owner]) return;
  const position = pointerPosition(event);
  state.baskets[owner].targetX = position.x;
  state.baskets[owner].targetY = position.y;
}

canvas.addEventListener("pointermove", (event) => {
  const owner = pointerOwners.get(event.pointerId);
  if (owner) movePointer(event, owner);
  else if (event.pointerType === "mouse") movePointer(event, "yellow");
});
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  const position = pointerPosition(event);
  const owner =
    state.opponent === "local" &&
    event.pointerType === "touch" &&
    position.x < W / 2
      ? "blue"
      : "yellow";
  pointerOwners.set(event.pointerId, owner);
  movePointer(event, owner);
  try {
    canvas.setPointerCapture(event.pointerId);
  } catch {}
});
const releasePointer = (event) => pointerOwners.delete(event.pointerId);
canvas.addEventListener("pointerup", releasePointer);
canvas.addEventListener("pointercancel", releasePointer);
canvas.addEventListener("lostpointercapture", releasePointer);
startButton.addEventListener("click", start);
pauseButton.addEventListener("click", pause);

function updateOpponentCopy() {
  const local = opponentSelect.value === "local";
  opponentRule.innerHTML = local
    ? "<b>03</b> Yellow uses WASD; blue uses arrow keys or a second touch"
    : "<b>03</b> Beat the clockwork blue net before all ten frogs are gone";
}

opponentSelect.addEventListener("change", updateOpponentCopy);

async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stage.requestFullscreen();
  } catch {}
}

document.querySelector("#fullscreen").addEventListener("click", fullscreen);
document.querySelector("#sound").addEventListener("click", () => {
  muted = !muted;
  const soundButton = document.querySelector("#sound");
  soundButton.textContent = muted ? "Sound off" : "Sound on";
  soundButton.setAttribute(
    "aria-label",
    muted ? "Turn sound on" : "Turn sound off",
  );
  tone(660);
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (
    [
      "arrowleft",
      "arrowright",
      "arrowup",
      "arrowdown",
      "w",
      "a",
      "s",
      "d",
    ].includes(key)
  ) {
    event.preventDefault();
    keys.add(key);
  }
  if (event.repeat) return;
  if (key === "p" || event.key === "Escape") pause();
  if (key === "f") fullscreen();
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target === document.body &&
    state.mode !== "playing" &&
    state.mode !== "winding"
  ) {
    event.preventDefault();
    start();
  }
});

window.addEventListener("keyup", (event) =>
  keys.delete(event.key.toLowerCase()),
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.mode === "playing") pause();
});
portraitPhone.addEventListener("change", (event) => {
  if (event.matches && state.mode === "playing") pause();
});

window.get_leap_frogs_events = () => structuredClone(state.events);

window.render_game_to_text = () => {
  const loaded = state.ledger.filter(
    (record) => record.status === "loaded",
  ).length;
  const airborne = state.ledger.filter(
    (record) => record.status === "airborne",
  ).length;
  const resolved = state.caughtBy.yellow + state.caughtBy.blue + state.missed;
  return JSON.stringify({
    coordinates:
      "1200×760; origin top-left, x right, y down; basket x/y is opening center",
    mode: state.mode,
    elapsed: +state.elapsed.toFixed(2),
    windTime: +state.windTime.toFixed(2),
    totalFrogs: TOTAL_FROGS,
    opponent: state.opponent,
    loaded,
    airborne,
    launched: state.launched,
    caughtBy: { ...state.caughtBy },
    missed: state.missed,
    resolved,
    conservation: loaded + airborne + resolved,
    nextCue:
      state.mode === "playing" && state.nextLaunch < 0.3
        ? "mechanical click"
        : null,
    baskets: {
      yellow: {
        ...state.baskets.yellow,
        catchRadiusX: CATCH_X,
        catchRadiusY: CATCH_Y,
      },
      blue: {
        ...state.baskets.blue,
        catchRadiusX: CATCH_X,
        catchRadiusY: CATCH_Y,
      },
    },
    frogs: state.frogs.map(({ id, pad, x, y, vx, vy, targetX, age }) => ({
      id,
      pad,
      x: +x.toFixed(1),
      y: +y.toFixed(1),
      vx: +vx.toFixed(1),
      vy: +vy.toFixed(1),
      targetX: +targetX.toFixed(1),
      catchable: vy > 0 && age > 0.35,
    })),
    result: state.lastResult,
    eventCount: state.events.length,
  });
};

window.advanceTime = (milliseconds) => {
  manual = true;
  for (let elapsed = 0; elapsed < milliseconds; elapsed += 1000 / 60) {
    update(Math.min(1000 / 60, milliseconds - elapsed) / 1000);
  }
  render();
};

function loop(now) {
  if (!manual) update(Math.min((now - last) / 1000 || 0, 0.04));
  last = now;
  render();
  requestAnimationFrame(loop);
}

Promise.all(
  Object.entries(assetPaths).map(
    ([key, path]) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          assets[key] = image;
          resolve();
        };
        image.onerror = () => reject(new Error(path));
        image.src = path;
      }),
  ),
)
  .then(() => {
    startButton.disabled = false;
    showReadyOverlay();
    requestAnimationFrame(loop);
  })
  .catch(() => {
    startButton.textContent = "Graphics failed to load. Please reload.";
  });
