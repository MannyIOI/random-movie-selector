/* Happy & Happy — our romantic movie night picker
 * Data comes from movies-data.js: TOP_250_MOVIES and SPICY_MOVIES.
 * Movies are stored locally so the picker no longer depends on a remote
 * dataset (the old remote source is dead, which forced the app onto a
 * 10-item fallback and capped every spin at the top 10).
 */

// ---- Elements ----
const listSelect = document.getElementById("listSelect");
const genreSelect = document.getElementById("genreSelect");
const maxNumberInput = document.getElementById("maxNumber");
const maxLabel = document.getElementById("maxLabel");
const maxRow = document.getElementById("maxRow");
const poolInfo = document.getElementById("poolInfo");
const spinBtn = document.getElementById("spinBtn");
const spinner = document.getElementById("spinner");
const result = document.getElementById("result");
const resultActions = document.getElementById("resultActions");
const markWatchedBtn = document.getElementById("markWatchedBtn");

const watchedList = document.getElementById("watchedList");
const watchedCount = document.getElementById("watchedCount");
const watchedEmpty = document.getElementById("watchedEmpty");
const clearWatchedBtn = document.getElementById("clearWatchedBtn");

const tabs = document.querySelectorAll(".tab");
const panels = {
  play: document.getElementById("panel-play"),
  watched: document.getElementById("panel-watched"),
};

const MIN_ROTATION_DEGREES = 1800;
const RANDOM_ROTATION_RANGE = 1080;
const WATCHED_STORAGE_KEY = "pacpicks.watched";

let currentRotation = 0;
let lastPick = null;
let spinning = false;

// ---- Watched persistence (Set of "title|year" keys) ----
function movieKey(movie) {
  return `${movie.title}|${movie.year}`;
}

function loadWatched() {
  try {
    const raw = localStorage.getItem(WATCHED_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveWatched(set) {
  try {
    localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage may be unavailable (private mode); ignore */
  }
}

let watched = loadWatched();

// ---- Data helpers ----
function getActiveList() {
  return listSelect.value === "spicy" ? SPICY_MOVIES : TOP_250_MOVIES;
}

function isRankedList() {
  return listSelect.value !== "spicy";
}

function allGenres() {
  const set = new Set();
  [...TOP_250_MOVIES, ...SPICY_MOVIES].forEach((m) =>
    (m.genres || []).forEach((g) => set.add(g))
  );
  return [...set].sort();
}

/* Movies eligible for the current spin: respects the selected list, the
 * rank cap (ranked lists only), the chosen genre and the watched list. */
function getCandidates() {
  let pool = getActiveList();

  if (isRankedList()) {
    const maxN = clampMax();
    pool = pool.slice(0, maxN);
  }

  const genre = genreSelect.value;
  if (genre) {
    pool = pool.filter((m) => (m.genres || []).includes(genre));
  }

  // Keep original index so ranked lists can report the true IMDb rank.
  return pool
    .map((movie) => ({ movie, rank: getActiveList().indexOf(movie) + 1 }))
    .filter(({ movie }) => !watched.has(movieKey(movie)));
}

function clampMax() {
  const listLength = getActiveList().length;
  const parsed = Number(maxNumberInput.value);
  const maxN = Number.isFinite(parsed)
    ? Math.max(1, Math.min(listLength, Math.floor(parsed)))
    : listLength;
  return maxN;
}

// ---- UI sync ----
function populateGenres() {
  const genres = allGenres();
  for (const g of genres) {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g.toUpperCase();
    genreSelect.appendChild(opt);
  }
}

function syncListUI() {
  const list = getActiveList();
  if (isRankedList()) {
    maxRow.hidden = false;
    maxNumberInput.max = String(list.length);
    maxLabel.textContent = String(list.length);
    if (Number(maxNumberInput.value) > list.length || !maxNumberInput.value) {
      maxNumberInput.value = String(list.length);
    }
  } else {
    // Spicy list is not rank-ordered, so a rank cap makes no sense.
    maxRow.hidden = true;
  }
  updatePoolInfo();
}

function updatePoolInfo() {
  const available = getCandidates().length;
  const listName = isRankedList() ? "IMDb Top 250" : "Spicy";
  const genre = genreSelect.value ? ` · ${genreSelect.value}` : "";
  poolInfo.textContent = `${available} movie${available === 1 ? "" : "s"} waiting for you two (${listName}${genre}). ♥`;
  spinBtn.disabled = available === 0;
  if (available === 0) {
    poolInfo.textContent =
      "No movies match — try another mood, raise the top picks, or bring back a watched title.";
  }
}

// ---- Spin ----
function spin() {
  if (spinning) return;
  const candidates = getCandidates();
  if (!candidates.length) {
    updatePoolInfo();
    return;
  }

  spinning = true;
  spinBtn.disabled = true;
  resultActions.hidden = true;
  spinner.classList.add("chomp");
  result.textContent = "Falling in love with a pick…";

  const choice = candidates[Math.floor(Math.random() * candidates.length)];
  lastPick = choice.movie;

  const extraRotation =
    MIN_ROTATION_DEGREES + Math.floor(Math.random() * RANDOM_ROTATION_RANGE);
  currentRotation += extraRotation;
  spinner.style.transform = `rotate(${currentRotation}deg)`;

  window.setTimeout(() => revealResult(choice), 2800);
}

function revealResult(choice) {
  spinning = false;
  spinner.classList.remove("chomp");

  const { movie, rank } = choice;
  const genres = (movie.genres || []).join(" · ") || "—";
  const label = isRankedList()
    ? `<span class="rank">#${rank}</span> ${escapeHtml(movie.title)} (${movie.year})`
    : `🌶️ ${escapeHtml(movie.title)} (${movie.year})`;

  result.innerHTML = `Tonight, together: ${label}<span class="genre">${escapeHtml(genres)}</span>`;
  resultActions.hidden = false;
  spinBtn.disabled = false;
  fireConfetti();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---- Watched actions ----
function markLastWatched() {
  if (!lastPick) return;
  watched.add(movieKey(lastPick));
  saveWatched(watched);
  renderWatched();
  updatePoolInfo();
  resultActions.hidden = true;
  result.innerHTML = `${escapeHtml(lastPick.title)} added to our memories together ♥`;
  lastPick = null;
}

function removeWatched(key) {
  watched.delete(key);
  saveWatched(watched);
  renderWatched();
  updatePoolInfo();
}

function renderWatched() {
  const keys = [...watched];
  watchedCount.textContent = `${keys.length} WATCHED`;
  watchedList.innerHTML = "";
  watchedEmpty.hidden = keys.length > 0;

  // Map keys back to titles for display.
  const byKey = new Map();
  [...TOP_250_MOVIES, ...SPICY_MOVIES].forEach((m) => byKey.set(movieKey(m), m));

  keys
    .map((key) => ({ key, movie: byKey.get(key) }))
    .sort((a, b) => {
      const at = a.movie ? a.movie.title : a.key;
      const bt = b.movie ? b.movie.title : b.key;
      return at.localeCompare(bt);
    })
    .forEach(({ key, movie }) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = movie ? `${movie.title} (${movie.year})` : key;
      const btn = document.createElement("button");
      btn.className = "remove-btn";
      btn.type = "button";
      btn.textContent = "✕";
      btn.setAttribute("aria-label", `Remove ${span.textContent} from watched`);
      btn.addEventListener("click", () => removeWatched(key));
      li.append(span, btn);
      watchedList.appendChild(li);
    });
}

function clearWatched() {
  if (!watched.size) return;
  watched = new Set();
  saveWatched(watched);
  renderWatched();
  updatePoolInfo();
}

// ---- Tabs ----
function switchTab(name) {
  tabs.forEach((t) => {
    const active = t.dataset.tab === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });
  Object.entries(panels).forEach(([key, panel]) => {
    const active = key === name;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
}

// ---- Confetti (self-contained canvas, no dependencies) ----
const confettiCanvas = document.getElementById("confetti");
const cctx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiRAF = null;

function sizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", sizeConfetti);
sizeConfetti();

function fireConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#ff5d8f", "#e11d67", "#ffcf8b", "#c8a2ff", "#ffd9e8", "#f5a742"];
  const count = 140;
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.3,
      size: 10 + Math.random() * 12,
      vx: -3 + Math.random() * 6,
      vy: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 120 + Math.random() * 60,
    });
  }
  if (!confettiRAF) confettiRAF = requestAnimationFrame(drawConfetti);
}

/* Draw a heart shape centred at (0,0) scaled to `s`. */
function heartPath(ctx, s) {
  ctx.beginPath();
  const t = s / 16;
  ctx.moveTo(0, 4 * t);
  ctx.bezierCurveTo(0, 1 * t, -3 * t, -2 * t, -6 * t, -2 * t);
  ctx.bezierCurveTo(-11 * t, -2 * t, -11 * t, 4 * t, -11 * t, 4 * t);
  ctx.bezierCurveTo(-11 * t, 8 * t, -6 * t, 11 * t, 0, 15 * t);
  ctx.bezierCurveTo(6 * t, 11 * t, 11 * t, 8 * t, 11 * t, 4 * t);
  ctx.bezierCurveTo(11 * t, 4 * t, 11 * t, -2 * t, 6 * t, -2 * t);
  ctx.bezierCurveTo(3 * t, -2 * t, 0, 1 * t, 0, 4 * t);
  ctx.closePath();
}

function drawConfetti() {
  cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter((p) => p.life > 0 && p.y < confettiCanvas.height + 40);
  for (const p of confettiPieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.rot += p.vr;
    p.life -= 1;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
    cctx.fillStyle = p.color;
    heartPath(cctx, p.size);
    cctx.fill();
    cctx.restore();
  }
  if (confettiPieces.length) {
    confettiRAF = requestAnimationFrame(drawConfetti);
  } else {
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiRAF = null;
  }
}

// ---- Ambient floating hearts drifting up the background ----
function seedFloatingHearts() {
  const container = document.querySelector(".floating-hearts");
  if (!container) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const glyphs = ["♥", "❤", "💕", "💖"];
  const total = 14;
  for (let i = 0; i < total; i++) {
    const heart = document.createElement("span");
    heart.className = "fh";
    heart.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${12 + Math.random() * 26}px`;
    heart.style.animationDuration = `${10 + Math.random() * 14}s`;
    heart.style.animationDelay = `${-Math.random() * 20}s`;
    heart.style.opacity = `${0.4 + Math.random() * 0.5}`;
    container.appendChild(heart);
  }
}

// ---- Wire up ----
spinBtn.addEventListener("click", spin);
markWatchedBtn.addEventListener("click", markLastWatched);
clearWatchedBtn.addEventListener("click", clearWatched);
listSelect.addEventListener("change", syncListUI);
genreSelect.addEventListener("change", updatePoolInfo);
maxNumberInput.addEventListener("input", updatePoolInfo);
maxNumberInput.addEventListener("change", () => {
  maxNumberInput.value = String(clampMax());
  updatePoolInfo();
});
tabs.forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));

// ---- Init ----
populateGenres();
renderWatched();
syncListUI();
seedFloatingHearts();
result.textContent = `Ready when you are, lovebirds — ${TOP_250_MOVIES.length} Top 250 & ${SPICY_MOVIES.length} spicy picks waiting. ♥`;
