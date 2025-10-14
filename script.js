// Charity Water Game Logic

// DOM Elements
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const hud = document.getElementById("hud");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const toast = document.getElementById("toast");
const gameArea = document.getElementById("game-area");
const cup = document.getElementById("cup");
const endScreen = document.getElementById("end-screen");
const finalScoreEl = document.getElementById("final-score");
const replayBtn = document.getElementById("replay-btn");

// Game State
let score = 0;
let time = 60;
let gameInterval = null;
let dropInterval = null;
let funRush = false;
let funRushTimeout = null;
let bestScore = localStorage.getItem("bestScore") || 0;

// Cup movement
let cupX = 160; // initial position (centered)
const cupWidth = 80;
const areaWidth = 400;

function showScreen(screen) {
  startScreen.classList.add("hidden");
  hud.classList.add("hidden");
  gameArea.classList.add("hidden");
  endScreen.classList.add("hidden");
  screen.classList.remove("hidden");
}

function startGame() {
  score = 0;
  time = 60;
  funRush = false;
  cupX = (areaWidth - cupWidth) / 2;
  updateCup();
  document.getElementById("running-number").textContent = score;
  timerEl.textContent = `Time: ${time}s`;
  clearDrops();
  showScreen(hud);
  gameArea.classList.remove("hidden");
  hud.classList.remove("hidden");
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameInterval = setInterval(gameTick, 1000);
  dropInterval = setInterval(spawnDrop, 900);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  clearTimeout(funRushTimeout);
  clearDrops();
  finalScoreEl.textContent = `Final Score: ${score}`;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    finalScoreEl.textContent += ` (Best!)`;
  } else {
    finalScoreEl.textContent += ` | Best: ${bestScore}`;
  }
  showScreen(endScreen);
}

function gameTick() {
  time--;
  timerEl.textContent = `Time: ${time}s`;
  if (time <= 0) {
    endGame();
  }
}

function spawnDrop() {
  const drop = document.createElement("div");
  drop.classList.add("drop");
  let type;
  if (funRush) {
    type = "blue";
  } else {
    const r = Math.random();
    if (r < 0.65) type = "blue";
    else if (r < 0.85) type = "red";
    else type = "green";
  }
  drop.classList.add(type);
  drop.dataset.type = type;
  drop.style.left = `${Math.random() * (areaWidth - 32)}px`;
  drop.style.top = "0px";
  // Color styling
  if (type === "blue") {
    drop.style.background =
      "linear-gradient(180deg, #00bfff 60%, #0071c5 100%)";
    drop.style.border = "2px solid #0071c5";
  } else if (type === "red") {
    drop.style.background =
      "linear-gradient(180deg, #00bfff 60%, #0071c5 100%)";
    drop.style.border = "4px solid #c50000";
  } else if (type === "green") {
    drop.style.background =
      "linear-gradient(180deg, #dda486ff 60%, #dda486ff 100%)";
    drop.style.border = "2px solid #22c55e";
  }
  gameArea.appendChild(drop);
  animateDrop(drop);
}

function animateDrop(drop) {
  let top = 0;
  // During Fun Rush, drops fall faster
  const speed = funRush ? 18 : 8;
  const interval = funRush ? 12 : 24;
  const fall = setInterval(() => {
    top += speed;
    drop.style.top = `${top}px`;
    // Check collision with cup
    if (top >= 560) {
      if (isColliding(drop, cup)) {
        handleCatch(drop);
        clearInterval(fall);
        drop.remove();
      } else {
        handleMiss(drop);
        clearInterval(fall);
        drop.remove();
      }
    }
  }, interval);
}

function isColliding(drop, cup) {
  const dropRect = drop.getBoundingClientRect();
  const cupRect = cup.getBoundingClientRect();
  return (
    dropRect.left < cupRect.right &&
    dropRect.right > cupRect.left &&
    dropRect.bottom > cupRect.top &&
    dropRect.top < cupRect.bottom
  );
}

function handleCatch(drop) {
  const type = drop.dataset.type;
  if (type === "blue") {
    score++;
    showToast("+1", "#0071c5");
  } else if (type === "red") {
    if (!funRush) {
      score -= 2;
      score = Math.max(0, score);
      showToast("-2", "#c50000");
      cup.classList.add("shake");
      setTimeout(() => cup.classList.remove("shake"), 300);
    } else {
      showToast("+1", "#0071c5"); // treat as blue during fun rush
      score++;
    }
  } else if (type === "green") {
    funRush = true;
    showToast("Fun Rush!", "#22c55e");
    if (funRushTimeout) clearTimeout(funRushTimeout);
    funRushTimeout = setTimeout(() => {
      funRush = false;
    }, 5000);
  }
  document.getElementById("running-number").textContent = score;
}

function handleMiss(drop) {
  const type = drop.dataset.type;
  if (type === "blue") {
    if (!funRush) {
      score--;
      score = Math.max(0, score);
      showToast("Miss -1", "#0071c5");
      document.getElementById("running-number").textContent = score;
    } else {
      showToast("+0", "#0071c5"); // no penalty during fun rush
    }
  }
  // Red miss: no change
}

function showToast(msg, color) {
  toast.textContent = msg;
  toast.classList.add("show");
  toast.style.background = color || "#0071c5";
  setTimeout(() => {
    toast.classList.remove("show");
    toast.style.background = "";
  }, 900);
}

function clearDrops() {
  document.querySelectorAll(".drop").forEach((d) => d.remove());
}

function updateCup() {
  cup.style.left = `${cupX}px`;
}

// Cup movement: keyboard
window.addEventListener("keydown", (e) => {
  if (gameArea.classList.contains("hidden")) return;
  if (e.key === "ArrowLeft") {
    cupX = Math.max(0, cupX - 32);
    updateCup();
  } else if (e.key === "ArrowRight") {
    cupX = Math.min(areaWidth - cupWidth, cupX + 32);
    updateCup();
  }
});

// Cup movement: drag/touch
let dragging = false;
cup.addEventListener("mousedown", (e) => {
  dragging = true;
});
document.addEventListener("mouseup", (e) => {
  dragging = false;
});
document.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const rect = gameArea.getBoundingClientRect();
  let x = e.clientX - rect.left - cupWidth / 2;
  cupX = Math.max(0, Math.min(areaWidth - cupWidth, x));
  updateCup();
});
// Touch support
cup.addEventListener("touchstart", (e) => {
  dragging = true;
});
document.addEventListener("touchend", (e) => {
  dragging = false;
});
document.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const rect = gameArea.getBoundingClientRect();
  let x = e.touches[0].clientX - rect.left - cupWidth / 2;
  cupX = Math.max(0, Math.min(areaWidth - cupWidth, x));
  updateCup();
});

// Start/Replay/Redo buttons
startBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", startGame);
document.getElementById("redo-btn").addEventListener("click", function () {
  startGame();
});

// Show start screen on load
showScreen(startScreen);
