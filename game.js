
/* =========================
   TREASURE RUSH MVP
========================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const state = {
  coins: Number(localStorage.getItem("tr_coins") || 0),
  gems: Number(localStorage.getItem("tr_gems") || 0),
  games: Number(localStorage.getItem("tr_games") || 0),
  best: Number(localStorage.getItem("tr_best") || 0),
  referrals: Number(localStorage.getItem("tr_referrals") || 0),
  refCash: Number(localStorage.getItem("tr_refCash") || 0)
};

let currentScreen = "homeScreen";

let game = {
  running: false,
  time: 120,
  coins: 0,
  gems: 0,
  score: 0,
  player: {
    x: 0,
    y: 0,
    size: 22
  },
  objects: [],
  direction: {
    x: 0,
    y: 0
  },
  lastTime: 0
};


/* =========================
   SAVE
========================= */

function saveState() {

  localStorage.setItem("tr_coins", state.coins);
  localStorage.setItem("tr_gems", state.gems);
  localStorage.setItem("tr_games", state.games);
  localStorage.setItem("tr_best", state.best);
  localStorage.setItem("tr_referrals", state.referrals);
  localStorage.setItem("tr_refCash", state.refCash);

}


/* =========================
   SCREEN
========================= */

function showScreen(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.add("active");
    currentScreen = id;
  }

  updateUI();

}


/* =========================
   UI
========================= */

function updateUI() {

  document.getElementById("homeCoins").textContent =
    state.coins.toLocaleString();

  document.getElementById("homeGems").textContent =
    state.gems.toLocaleString();

  document.getElementById("homeBest").textContent =
    state.best.toLocaleString();

  document.getElementById("myRankScore").textContent =
    state.best.toLocaleString();

  document.getElementById("profileCoins").textContent =
    state.coins.toLocaleString();

  document.getElementById("profileGems").textContent =
    state.gems.toLocaleString();

  document.getElementById("profileGames").textContent =
    state.games.toLocaleString();

  document.getElementById("profileBest").textContent =
    state.best.toLocaleString();

  document.getElementById("profileReferrals").textContent =
    state.referrals.toLocaleString();

  document.getElementById("profileRefCash").textContent =
    state.refCash.toFixed(3);

  document.getElementById("withdrawCoins").textContent =
    state.coins.toLocaleString();

  document.getElementById("withdrawDollar").textContent =
    (state.coins / 20000).toFixed(2);

}


/* =========================
   GAME START
========================= */

function startGame() {

  showScreen("gameScreen");

  resizeCanvas();

  game.running = true;
  game.time = 120;
  game.coins = 0;
  game.gems = 0;
  game.score = 0;

  game.player.x = canvas.width / 2;
  game.player.y = canvas.height / 2;

  game.direction.x = 0;
  game.direction.y = 0;

  createObjects();

  game.lastTime = performance.now();

  requestAnimationFrame(gameLoop);

}


/* =========================
   CANVAS SIZE
========================= */

function resizeCanvas() {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

}


/* =========================
   OBJECTS
========================= */

function createObjects() {

  game.objects = [];

  for (let i = 0; i < 35; i++) {

    game.objects.push({
      type: "coin",
      x: random(40, canvas.width - 40),
      y: random(80, canvas.height - 40),
      size: 10
    });

  }

  for (let i = 0; i < 7; i++) {

    game.objects.push({
      type: "gem",
      x: random(40, canvas.width - 40),
      y: random(80, canvas.height - 40),
      size: 13
    });

  }

  for (let i = 0; i < 3; i++) {

    game.objects.push({
      type: "chest",
      x: random(50, canvas.width - 50),
      y: random(100, canvas.height - 50),
      size: 18
    });

  }

}


function random(min, max) {

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;

}


/* =========================
   GAME LOOP
========================= */

function gameLoop(now) {

  if (!game.running) return;

  const delta = Math.min(
    (now - game.lastTime) / 1000,
    0.1
  );

  game.lastTime = now;

  game.time -= delta;

  if (game.time <= 0) {

    game.time = 0;
    endGame();

    return;

  }

  updateGame(delta);
  drawGame();
  updateGameHUD();

  requestAnimationFrame(gameLoop);

}


/* =========================
   UPDATE
========================= */

function updateGame(delta) {

  const speed = 280;

  let dx = game.direction.x;
  let dy = game.direction.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  if (length > 0) {

    dx /= length;
    dy /= length;

  }

  game.player.x += dx * speed * delta;
  game.player.y += dy * speed * delta;

  const r = game.player.size;

  game.player.x =
    Math.max(r, Math.min(canvas.width - r, game.player.x));

  game.player.y =
    Math.max(70 + r, Math.min(canvas.height - r, game.player.y));

  collectObjects();

}


/* =========================
   COLLECT
========================= */

function collectObjects() {

  game.objects = game.objects.filter(obj => {

    const dx = game.player.x - obj.x;
    const dy = game.player.y - obj.y;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

    if (distance < game.player.size + obj.size) {

      if (obj.type === "coin") {

        game.coins += 1;
        game.score += 10;

      }

      if (obj.type === "gem") {

        game.gems += 1;
        game.score += 50;

      }

      if (obj.type === "chest") {

        game.coins += 10;
        game.score += 100;

        showToast("🎁 Treasure Chest! +10 Coins");

      }

      return false;

    }

    return true;

  });

}


/* =========================
   DRAW
========================= */

function drawGame() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /* GRASS */

  ctx.fillStyle = "#286f3e";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* GRASS DETAILS */

  for (let i = 0; i < 80; i++) {

    const x = (i * 137) % canvas.width;
    const y = 80 + ((i * 79) % Math.max(100, canvas.height - 100));

    ctx.fillStyle = "rgba(255,255,255,.035)";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      18,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  /* OBJECTS */

  game.objects.forEach(obj => {

    if (obj.type === "coin") {

      ctx.fillStyle = "#ffd447";

      ctx.beginPath();

      ctx.arc(
        obj.x,
        obj.y,
        obj.size,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.strokeStyle = "#fff0a0";
      ctx.lineWidth = 2;
      ctx.stroke();

    }


    if (obj.type === "gem") {

      ctx.fillStyle = "#a95cff";

      ctx.beginPath();

      ctx.moveTo(obj.x, obj.y - obj.size);
      ctx.lineTo(obj.x + obj.size, obj.y);
      ctx.lineTo(obj.x, obj.y + obj.size);
      ctx.lineTo(obj.x - obj.size, obj.y);

      ctx.closePath();
      ctx.fill();

    }


    if (obj.type === "chest") {

      ctx.fillStyle = "#9b5a25";

      ctx.fillRect(
        obj.x - 18,
        obj.y - 13,
        36,
        26
      );

      ctx.fillStyle = "#ffd447";

      ctx.fillRect(
        obj.x - 3,
        obj.y - 4,
        6,
        8
      );

    }

  });


  /* PLAYER SHADOW */

  ctx.fillStyle = "rgba(0,0,0,.25)";

  ctx.beginPath();

  ctx.ellipse(
    game.player.x,
    game.player.y + 18,
    22,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* PLAYER */

  ctx.fillStyle = "#ffb347";

  ctx.beginPath();

  ctx.arc(
    game.player.x,
    game.player.y,
    game.player.size,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();


  /* EYES */

  ctx.fillStyle = "#222";

  ctx.beginPath();

  ctx.arc(
    game.player.x - 7,
    game.player.y - 4,
    3,
    0,
    Math.PI * 2
  );

  ctx.arc(
    game.player.x + 7,
    game.player.y - 4,
    3,
    0,
    Math.PI * 2
  );

  ctx.fill();

}


/* =========================
   HUD
========================= */

function updateGameHUD() {

  const minutes =
    Math.floor(game.time / 60);

  const seconds =
    Math.floor(game.time % 60);

  document.getElementById("gameTimer").textContent =
    minutes + ":" + String(seconds).padStart(2, "0");

  document.getElementById("gameCoins").textContent =
    game.coins;

  document.getElementById("gameGems").textContent =
    game.gems;

  document.getElementById("gameScore").textContent =
    game.score;

}


/* =========================
   END GAME
========================= */

function endGame() {

  if (!game.running) return;

  game.running = false;

  state.coins += game.coins;
  state.gems += game.gems;
  state.games += 1;

  if (game.score > state.best) {

    state.best = game.score;

  }

  saveState();

  document.getElementById("resultCoins").textContent =
    game.coins;

  document.getElementById("resultGems").textContent =
    game.gems;

  document.getElementById("resultScore").textContent =
    game.score;

  showScreen("resultScreen");

}


/* =========================
   JOYSTICK
========================= */

const joystick =
  document.getElementById("joystick");

const knob =
  document.getElementById("joystickKnob");

let joystickActive = false;

function moveJoystick(clientX, clientY) {

  const rect =
    joystick.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const centerY =
    rect.top + rect.height / 2;

  let dx = clientX - centerX;
  let dy = clientY - centerY;

  const max = 45;

  const distance =
    Math.sqrt(dx * dx + dy * dy);

  if (distance > max) {

    dx = dx / distance * max;
    dy = dy / distance * max;

  }

  knob.style.transform =
    `translate(${dx}px, ${dy}px)`;

  game.direction.x = dx / max;
  game.direction.y = dy / max;

}


joystick.addEventListener("pointerdown", e => {

  joystickActive = true;

  joystick.setPointerCapture(e.pointerId);

  moveJoystick(
    e.clientX,
    e.clientY
  );

});


joystick.addEventListener("pointermove", e => {

  if (!joystickActive) return;

  moveJoystick(
    e.clientX,
    e.clientY
  );

});


joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);


function resetJoystick() {

  joystickActive = false;

  knob.style.transform =
    "translate(0,0)";

  game.direction.x = 0;
  game.direction.y = 0;

}


/* =========================
   KEYBOARD
========================= */

window.addEventListener("keydown", e => {

  if (!game.running) return;

  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
    game.direction.y = -1;
  }

  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
    game.direction.y = 1;
  }

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    game.direction.x = -1;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    game.direction.x = 1;
  }

});


window.addEventListener("keyup", e => {

  if (
    ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight",
     "w","a","s","d"].includes(e.key)
  ) {

    game.direction.x = 0;
    game.direction.y = 0;

  }

});


/* =========================
   WITHDRAW
========================= */

let selectedMethod = "";

function selectMethod(method) {

  selectedMethod = method;

  document.getElementById("selectedMethod").textContent =
    "Selected: " + method;

}


function requestWithdraw() {

  const requiredCoins = 2000000;

  if (state.coins < requiredCoins) {

    showToast(
      "❌ You need 2,000,000 Coins ($100)"
    );

    return;

  }

  if (!selectedMethod) {

    showToast(
      "⚠️ Select a withdrawal method"
    );

    return;

  }

  showToast(
    "✅ Withdrawal request submitted"
  );

}


/* =========================
   TOAST
========================= */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;
  toast.style.display = "block";

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {

      toast.style.display = "none";

    }, 2200);

}


/* =========================
   RESIZE
========================= */

window.addEventListener("resize", () => {

  if (game.running) {

    resizeCanvas();

  }

});


/* =========================
   INITIAL
========================= */

updateUI();
showScreen("homeScreen");
