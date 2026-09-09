const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const stage = document.querySelector("#stage");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start-btn");
const pauseButton = document.querySelector("#pause");
const W = 1200,
  H = 760,
  CX = 600,
  CY = 395,
  SIZE = 458;
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
let best = 0;
try {
  best = Number(localStorage.getItem("leapfrogs-best")) || 0;
} catch {}
let state,
  muted = true,
  audio,
  manual = false,
  last = 0,
  seed = 17;
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
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
function reset(mode = "ready") {
  seed = 17;
  state = {
    mode,
    time: 60,
    elapsed: 0,
    score: 0,
    caught: 0,
    missed: 0,
    streak: 0,
    bestStreak: 0,
    rotation: 0,
    next: 0.8,
    warning: null,
    frogs: [],
    particles: [],
    basket: { x: 920, y: 490 },
    id: 0,
  };
}
reset();
function tone(freq, duration = 0.12) {
  if (muted) return;
  try {
    audio ||= new AudioContext();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(
      freq * 0.6,
      audio.currentTime + duration,
    );
    g.gain.setValueAtTime(0.075, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + duration);
  } catch {}
}
function padPosition(index) {
  const [x, y] = pads[index],
    s = SIZE / 522,
    c = Math.cos(state.rotation),
    n = Math.sin(state.rotation);
  return { x: CX + (x * c - y * n) * s, y: CY + (x * n + y * c) * s };
}
function launch(index) {
  const p = padPosition(index),
    target = 125 + random() * 950;
  const vy = -Math.sqrt(2 * 650 * Math.min(240, Math.max(45, p.y - 155)));
  const duration = (-vy + Math.sqrt(vy * vy + 2 * 650 * (725 - p.y))) / 650;
  const vx = (target - p.x) / duration;
  state.frogs.push({
    id: ++state.id,
    x: p.x,
    y: p.y,
    vx,
    vy,
    age: 0,
    trail: [],
  });
  tone(360, 0.08);
}
function burst(x, y, label, color) {
  state.particles.push({ x, y, label, color, life: 1 });
}
function finish() {
  state.mode = "over";
  best = Math.max(best, state.score);
  try {
    localStorage.setItem("leapfrogs-best", best);
  } catch {}
  showOverlay(
    "ROUND COMPLETE",
    state.caught ? "Nice<br><em>catch!</em>" : "One more<br><em>hop?</em>",
    `${state.score} points · ${state.caught} frogs caught<br>Best streak: ${state.bestStreak} · Personal best: ${best}`,
    "Play again",
    "A new round. A fresh batch of frogs.",
  );
}
function update(dt) {
  if (state.mode !== "playing") return;
  state.elapsed += dt;
  state.time = Math.max(0, 60 - state.elapsed);
  state.rotation += dt * (0.28 + state.elapsed * 0.003);
  state.next -= dt;
  if (state.next <= 0 && !state.warning) {
    state.warning = { index: Math.floor(random() * pads.length), left: 0.48 };
  }
  if (state.warning) {
    state.warning.left -= dt;
    if (state.warning.left <= 0) {
      launch(state.warning.index);
      state.warning = null;
      state.next = Math.max(0.55, 1.3 - state.elapsed * 0.013);
    }
  }
  for (const f of state.frogs) {
    f.age += dt;
    f.trail.unshift({ x: f.x, y: f.y });
    if (f.trail.length > 12) f.trail.pop();
    f.x += f.vx * dt;
    f.vy += 650 * dt;
    f.y += f.vy * dt;
    const b = state.basket;
    if (
      f.vy > 0 &&
      f.age > 0.35 &&
      Math.pow((f.x - b.x) / 66, 2) + Math.pow((f.y - b.y) / 34, 2) < 1
    ) {
      f.done = true;
      state.caught++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const points = 10 + Math.min(4, Math.floor((state.streak - 1) / 5)) * 5;
      state.score += points;
      burst(f.x, f.y, `+${points}`, "#ffe44f");
      tone(620 + Math.min(state.streak, 15) * 30);
    } else if (f.y > H + 45 || f.x < -70 || f.x > W + 70) {
      f.done = true;
      state.missed++;
      state.streak = 0;
      burst(clamp(f.x, 70, W - 70), H - 40, "escaped", "#9bd9d0");
    }
  }
  state.frogs = state.frogs.filter((f) => !f.done);
  for (const p of state.particles) {
    p.life -= dt;
    p.y -= dt * 42;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  if (!state.time) finish();
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
function ellipse(x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function picture(key, x, y, width, angle = 0) {
  const img = assets[key];
  if (!img) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(
    img,
    -width / 2,
    (-width * img.height) / img.width / 2,
    width,
    (width * img.height) / img.width,
  );
  ctx.restore();
}
function render() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#164d61");
  bg.addColorStop(1, "#082e49");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  for (let y = 24; y < H; y += 32)
    for (let x = 24; x < W; x += 32) ellipse(x, y, 1, 1, "#ffffff0c");
  ellipse(CX, CY + 70, 390, 265, "#051e3630");
  ctx.strokeStyle = "#7da89922";
  ctx.lineWidth = 1;
  [310, 340, 370].forEach((r) => {
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  text("FROGS CAUGHT", 40, 44, 11, "#a6c8ce");
  text(String(state.caught).padStart(2, "0"), 40, 84, 38);
  text("SCORE", 170, 44, 11, "#a6c8ce");
  text(String(state.score).padStart(3, "0"), 170, 84, 38, "#ffe44f");
  text("TIME LEFT", W / 2, 39, 10, "#a6c8ce", "center");
  text(
    `${Math.floor(Math.ceil(state.time) / 60)}:${String(Math.ceil(state.time) % 60).padStart(2, "0")}`,
    W / 2,
    77,
    34,
    state.time <= 10 ? "#ffbc8b" : "#fff9df",
    "center",
  );
  text("PERSONAL BEST", W - 40, 44, 11, "#a6c8ce", "right");
  text(best, W - 40, 81, 28, "#ffe44f", "right");
  ctx.fillStyle = "#062b40";
  ctx.fillRect(40, 105, W - 80, 4);
  ctx.fillStyle = state.time <= 10 ? "#ffbc8b" : "#a7dfaa";
  ctx.fillRect(40, 105, ((W - 80) * state.time) / 60, 4);
  ctx.save();
  ctx.shadowColor = "#00162680";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 20;
  picture("table", CX, CY, 550);
  ctx.restore();
  ellipse(CX, CY, SIZE / 2, SIZE / 2, "#00623b");
  picture("platter", CX, CY, SIZE, state.rotation);
  pads.forEach((_, i) => {
    const p = padPosition(i);
    ellipse(p.x, p.y, 31, 31, "#005431");
    ellipse(p.x, p.y, 27, 27, "#007943");
    picture("frog1", p.x, p.y, 38);
    if (state.warning?.index === i) {
      ctx.strokeStyle = "#fff6bd";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        34 + Math.sin(state.warning.left * 30) * 3,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  });
  picture("crank", CX, CY, 123, -state.rotation * 1.8);
  if (state.mode === "ready") {
    picture("frog2", 935, 295, 110, -0.15);
    picture("frog3", 255, 420, 86, 0.2);
  }
  for (const f of state.frogs) {
    f.trail.forEach((p, i) => {
      if (i % 3 === 0)
        ellipse(
          p.x,
          p.y,
          8 - i * 0.45,
          8 - i * 0.45,
          `rgba(255,237,120,${0.12 * (1 - i / 12)})`,
        );
    });
    ellipse(f.x, Math.min(730, f.y + 70), 23, 7, "#00182725");
    picture(
      f.vy < -80 ? "frog1" : f.vy < 100 ? "frog2" : "frog3",
      f.x,
      f.y,
      66 + Math.sin(Math.min(1, f.age / 1.9) * Math.PI) * 14,
      f.vx * 0.0007,
    );
  }
  const b = state.basket;
  ellipse(b.x, b.y + 103, 76, 13, "#001b343a");
  picture("basket", b.x, b.y + 39, 168);
  ctx.strokeStyle = "#fff5bc80";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(b.x - 7, b.y);
  ctx.lineTo(b.x + 7, b.y);
  ctx.moveTo(b.x, b.y - 7);
  ctx.lineTo(b.x, b.y + 7);
  ctx.stroke();
  for (const p of state.particles) {
    ctx.globalAlpha = p.life;
    text(p.label, p.x, p.y, 28, p.color, "center");
    ctx.globalAlpha = 1;
  }
  text(
    state.streak >= 5
      ? `${state.streak} IN A ROW · +${10 + Math.min(4, Math.floor((state.streak - 1) / 5)) * 5} PER CATCH`
      : "WATCH THE GLOW. CATCH THE FALL.",
    W / 2,
    713,
    12,
    state.streak >= 5 ? "#ffe44f" : "#a6c8ce",
    "center",
  );
  text(`${state.missed} escaped`, W - 40, 713, 12, "#7da6b6", "right", 400);
}
function showOverlay(eyebrow, title, description, button, hint) {
  document.querySelector("#eyebrow").textContent = eyebrow;
  document.querySelector("#title").innerHTML = title;
  document.querySelector("#description").innerHTML = description;
  document.querySelector("#instructions").hidden = true;
  document.querySelector("#instructions").style.display = "none";
  document.querySelector("#hint").textContent = hint;
  startButton.textContent = button;
  overlay.hidden = false;
  stage.classList.remove("playing");
  stage.classList.add("paused");
  pauseButton.disabled = state.mode === "over";
  pauseButton.textContent = "Pause";
}
function start() {
  if (state.mode === "paused") {
    state.mode = "playing";
  } else reset("playing");
  overlay.hidden = true;
  stage.classList.remove("paused");
  stage.classList.add("playing");
  pauseButton.disabled = false;
  pauseButton.textContent = "Pause";
  tone(520);
  last = performance.now();
}
function pause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    showOverlay(
      "TAKE A BREATHER",
      "Pond<br><em>pause.</em>",
      "Your frogs will wait right here.",
      "Keep catching",
      "Press P or Escape to resume.",
    );
    pauseButton.textContent = "Resume";
  } else if (state.mode === "paused") start();
}
function move(e) {
  const r = canvas.getBoundingClientRect();
  const scale = Math.min(r.width / W, r.height / H),
    ox = r.left + (r.width - W * scale) / 2,
    oy = r.top + (r.height - H * scale) / 2;
  state.basket.x = clamp((e.clientX - ox) / scale, 85, W - 85);
  state.basket.y = clamp((e.clientY - oy) / scale, 145, H - 115);
}
canvas.addEventListener("pointermove", move);
canvas.addEventListener("pointerdown", (e) => {
  move(e);
  canvas.setPointerCapture(e.pointerId);
});
startButton.addEventListener("click", start);
pauseButton.addEventListener("click", pause);
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stage.requestFullscreen();
  } catch {}
}
document.querySelector("#fullscreen").addEventListener("click", fullscreen);
document.querySelector("#sound").addEventListener("click", () => {
  muted = !muted;
  document.querySelector("#sound").textContent = muted
    ? "Sound off"
    : "Sound on";
  document
    .querySelector("#sound")
    .setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
  tone(660);
});
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key.toLowerCase() === "p" || e.key === "Escape") pause();
  if (e.key.toLowerCase() === "f") fullscreen();
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target === document.body &&
    state.mode !== "playing"
  ) {
    e.preventDefault();
    start();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.mode === "playing") pause();
});
window.render_game_to_text = () =>
  JSON.stringify({
    coordinates:
      "1200×760; origin top-left, x right, y down; basket x/y is opening center",
    mode: state.mode,
    time: +state.time.toFixed(2),
    score: state.score,
    caught: state.caught,
    missed: state.missed,
    streak: state.streak,
    best,
    basket: { ...state.basket, catchRadiusX: 66, catchRadiusY: 34 },
    frogs: state.frogs.map(({ id, x, y, vx, vy, age }) => ({
      id,
      x: +x.toFixed(1),
      y: +y.toFixed(1),
      vx: +vx.toFixed(1),
      vy: +vy.toFixed(1),
      catchable: vy > 0 && age > 0.35,
    })),
    warning: state.warning ? padPosition(state.warning.index) : null,
  });
window.advanceTime = (ms) => {
  manual = true;
  for (let t = 0; t < ms; t += 1000 / 60)
    update(Math.min(1000 / 60, ms - t) / 1000);
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
        const img = new Image();
        img.onload = () => {
          assets[key] = img;
          resolve();
        };
        img.onerror = () => reject(new Error(path));
        img.src = path;
      }),
  ),
)
  .then(() => {
    startButton.disabled = false;
    startButton.textContent = "Let’s catch frogs →";
    requestAnimationFrame(loop);
  })
  .catch(() => {
    startButton.textContent = "Graphics failed to load. Please reload.";
  });
