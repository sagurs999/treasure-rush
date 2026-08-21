/* Treasure Rush - Professional Runner Game
   game.js
   - 3-lane endless runner
   - swipe / keyboard controls
   - health system
   - coins + gems
   - chase obstacle
   - spin rewards
   - completed-ad reward hook
   - referral commission
   - localStorage persistence
*/

(() => {
  "use strict";

  const CONFIG = {
    coinPerCompletedAd: 20,
    referralCommission: 0.050,
    withdrawMinimumUSD: 25,
    coinsPerDollar: 20000,
    spinRewards: [
      { type: "coins", amount: 20, label: "+20 Coins", weight: 40 },
      { type: "coins", amount: 50, label: "+50 Coins", weight: 30 },
      { type: "coins", amount: 100, label: "+100 Coins", weight: 15 },
      { type: "gems", amount: 10, label: "+10 Gems", weight: 7 },
      { type: "gems", amount: 30, label: "+30 Gems", weight: 5 },
      { type: "gems", amount: 50, label: "+50 Gems", weight: 2 },
      { type: "cash", amount: 0.020, label: "+$0.020", weight: 1 }
    ]
  };

  const state = {
    coins: Number(localStorage.getItem("tr_coins") || 0),
    gems: Number(localStorage.getItem("tr_gems") || 0),
    cash: Number(localStorage.getItem("tr_cash") || 0),
    best: Number(localStorage.getItem("tr_best") || 0),
    health: 3,
    score: 0,
    distance: 0,
    speed: 6,
    lane: 1,
    targetLane: 1,
    running: false,
    paused: false,
    lastTime: 0,
    spawnTimer: 0,
    coinTimer: 0,
    invulnerableUntil: 0,
    adCompletedCount: Number(localStorage.getItem("tr_ad_completed") || 0),
    spinAvailable: localStorage.getItem("tr_spin_available") !== "0",
    lastReward: null
  };

  const $ = (id) => document.getElementById(id);

  function save() {
    localStorage.setItem("tr_coins", String(Math.floor(state.coins)));
    localStorage.setItem("tr_gems", String(Math.floor(state.gems)));
    localStorage.setItem("tr_cash", String(state.cash));
    localStorage.setItem("tr_best", String(Math.floor(state.best)));
    localStorage.setItem("tr_ad_completed", String(state.adCompletedCount));
    localStorage.setItem("tr_spin_available", state.spinAvailable ? "1" : "0");
  }

  function emit(name, detail = {}) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function updateHUD() {
    const map = {
      coins: state.coins,
      gems: state.gems,
      cash: state.cash.toFixed(3),
      best: Math.floor(state.best),
      score: Math.floor(state.score),
      health: state.health
    };

    Object.entries(map).forEach(([key, value]) => {
      document.querySelectorAll(`[data-stat="${key}"]`).forEach(el => {
        el.textContent = value;
      });
    });

    document.querySelectorAll("[data-health]").forEach(el => {
      el.textContent = "❤️".repeat(Math.max(0, state.health));
    });

    document.querySelectorAll("[data-spin]").forEach(el => {
      el.disabled = !state.spinAvailable || state.running;
      el.classList.toggle("disabled", !state.spinAvailable);
    });

    document.querySelectorAll("[data-ad-count]").forEach(el => {
      el.textContent = state.adCompletedCount;
    });
  }

  function addCoins(amount) {
    state.coins += amount;
    save();
    updateHUD();
    emit("treasure:balance", { coins: state.coins, gems: state.gems, cash: state.cash });
  }

  function addGems(amount) {
    state.gems += amount;
    save();
    updateHUD();
    emit("treasure:balance", { coins: state.coins, gems: state.gems, cash: state.cash });
  }

  function addCash(amount) {
    state.cash += amount;
    save();
    updateHUD();
    emit("treasure:balance", { coins: state.coins, gems: state.gems, cash: state.cash });
  }

  // Call this ONLY after the ad provider confirms the ad was completed.
  function onCompletedAd() {
    state.adCompletedCount += 1;
    addCoins(CONFIG.coinPerCompletedAd);
    emit("treasure:ad-completed", {
      reward: CONFIG.coinPerCompletedAd,
      totalCompletedAds: state.adCompletedCount
    });
    toast(`Ad completed • +${CONFIG.coinPerCompletedAd} Coins`);
  }

  // External ad SDK can call: window.TreasureRush.onCompletedAd()
  window.TreasureRush = window.TreasureRush || {};
  window.TreasureRush.onCompletedAd = onCompletedAd;

  function weightedReward() {
    const total = CONFIG.spinRewards.reduce((sum, r) => sum + r.weight, 0);
    let roll = Math.random() * total;
    for (const reward of CONFIG.spinRewards) {
      roll -= reward.weight;
      if (roll <= 0) return reward;
    }
    return CONFIG.spinRewards[0];
  }

  function spin() {
    if (!state.spinAvailable) {
      toast("Spin already used. Watch a completed ad to unlock another spin.");
      return;
    }

    if (state.running) {
      toast("Finish the run before spinning.");
      return;
    }

    state.spinAvailable = false;
    const reward = weightedReward();
    state.lastReward = reward;
    save();
    updateHUD();

    // UI can animate the wheel itself; this event carries the final reward.
    emit("treasure:spin-result", reward);

    if (reward.type === "coins") addCoins(reward.amount);
    if (reward.type === "gems") addGems(reward.amount);
    if (reward.type === "cash") addCash(reward.amount);

    toast(`🎁 ${reward.label}`);
    emit("treasure:reward-earned", reward);
  }

  function unlockSpinAfterCompletedAd() {
    state.spinAvailable = true;
    save();
    updateHUD();
  }

  function toast(message) {
    let el = $("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.cssText =
        "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);" +
        "z-index:99999;padding:12px 18px;border-radius:14px;" +
        "background:rgba(10,18,28,.94);color:#fff;font-weight:800;" +
        "box-shadow:0 10px 30px rgba(0,0,0,.35);pointer-events:none;" +
        "transition:opacity .2s ease;";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = "1";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => (el.style.opacity = "0"), 1800);
  }

  const canvas = $("gameCanvas") || document.querySelector("canvas[data-runner]");
  if (!canvas) {
    updateHUD();
    window.TreasureRush.spin = spin;
    window.TreasureRush.unlockSpinAfterCompletedAd = unlockSpinAfterCompletedAd;
    return;
  }

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * DPR));
    canvas.height = Math.max(1, Math.floor(rect.height * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  const player = {
    x: 0,
    y: 0,
    w: 44,
    h: 62,
    bob: 0
  };

  const objects = [];

  function laneX(lane) {
    const w = canvas.clientWidth || 360;
    const laneWidth = Math.min(w * 0.26, 120);
    const center = w / 2;
    return center + (lane - 1) * laneWidth;
  }

  function roadTopY() {
    return canvas.clientHeight * 0.25;
  }

  function roadBottomY() {
    return canvas.clientHeight * 0.94;
  }

  function spawn(type) {
    const lane = Math.floor(Math.random() * 3);
    objects.push({
      type,
      lane,
      z: 0,
      speed: 0.00045 + Math.random() * 0.00015,
      collected: false
    });
  }

  function project(obj) {
    const t = Math.min(1, obj.z);
    const y = roadTopY() + (roadBottomY() - roadTopY()) * t;
    const scale = 0.35 + 0.9 * t;
    const x = laneX(obj.lane);
    return { x, y, scale };
  }

  function drawBackground() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#071827");
    sky.addColorStop(0.5, "#0b3b4f");
    sky.addColorStop(1, "#174d36");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant jungle / ruins
    ctx.fillStyle = "#123a2e";
    for (let i = 0; i < 12; i++) {
      const x = (i / 11) * w;
      const hh = 30 + (i % 4) * 18;
      ctx.beginPath();
      ctx.moveTo(x - 55, roadTopY() + 35);
      ctx.lineTo(x, roadTopY() - hh);
      ctx.lineTo(x + 55, roadTopY() + 35);
      ctx.fill();
    }

    // Road
    const top = roadTopY();
    const bottom = roadBottomY();
    ctx.fillStyle = "#123f35";
    ctx.beginPath();
    ctx.moveTo(w * 0.38, top);
    ctx.lineTo(w * 0.62, top);
    ctx.lineTo(w * 0.95, bottom);
    ctx.lineTo(w * 0.05, bottom);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(55,210,150,.35)";
    ctx.lineWidth = 3;
    for (let lane = 1; lane <= 2; lane++) {
      const topX = w * (0.38 + lane * 0.12);
      const bottomX = w * (0.05 + lane * 0.45);
      ctx.beginPath();
      ctx.moveTo(topX, top);
      ctx.lineTo(bottomX, bottom);
      ctx.stroke();
    }

    // Road speed lines
    const offset = (state.distance * 0.03) % 90;
    ctx.strokeStyle = "rgba(120,255,200,.12)";
    ctx.lineWidth = 4;
    for (let y = bottom - offset; y > top; y -= 90) {
      const t = (y - top) / (bottom - top);
      const left = w * (0.38 - 0.33 * t);
      const right = w * (0.62 + 0.33 * t);
      ctx.beginPath();
      ctx.moveTo(left + 25, y);
      ctx.lineTo(right - 25, y);
      ctx.stroke();
    }
  }

  function drawPlayer() {
    const x = laneX(state.lane);
    const h = canvas.clientHeight;
    const y = h * 0.79 + Math.sin(player.bob) * 4;

    player.x = x;
    player.y = y;

    ctx.save();
    ctx.translate(x, y);

    if (performance.now() < state.invulnerableUntil) {
      ctx.globalAlpha = Math.floor(performance.now() / 100) % 2 ? 0.45 : 1;
    }

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.beginPath();
    ctx.ellipse(0, 27, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = "#202a32";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, 20);
    ctx.lineTo(-14, 43);
    ctx.moveTo(8, 20);
    ctx.lineTo(14, 43);
    ctx.stroke();

    // Body
    ctx.fillStyle = "#d65f3c";
    ctx.beginPath();
    ctx.roundRect(-17, -18, 34, 45, 12);
    ctx.fill();

    // Backpack
    ctx.fillStyle = "#5c3928";
    ctx.fillRect(-24, -11, 9, 31);

    // Head
    ctx.fillStyle = "#f1b27d";
    ctx.beginPath();
    ctx.arc(0, -31, 14, 0, Math.PI * 2);
    ctx.fill();

    // Hair / hat
    ctx.fillStyle = "#5b3527";
    ctx.beginPath();
    ctx.arc(0, -36, 15, Math.PI, Math.PI * 2);
    ctx.fill();

    // Hat
    ctx.fillStyle = "#e1b75b";
    ctx.beginPath();
    ctx.ellipse(0, -42, 19, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-11, -48, 22, 7);

    ctx.restore();
  }

  function drawObject(obj) {
    const p = project(obj);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);

    if (obj.type === "coin") {
      ctx.fillStyle = "#ffd33d";
      ctx.strokeStyle = "#fff0a1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#9d6500";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("C", 0, 1);
    } else if (obj.type === "gem") {
      ctx.fillStyle = "#55c9ff";
      ctx.strokeStyle = "#d8f7ff";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(14, -4);
      ctx.lineTo(5, 17);
      ctx.lineTo(-5, 17);
      ctx.lineTo(-14, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Ancient ruin obstacle
      ctx.fillStyle = "#786144";
      ctx.fillRect(-18, -22, 36, 44);
      ctx.fillStyle = "#a78958";
      ctx.fillRect(-24, -27, 48, 8);
      ctx.fillStyle = "#3e3428";
      ctx.fillRect(-9, -8, 18, 16);
    }

    ctx.restore();
  }

  function drawChaser() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const progress = Math.min(1, state.distance / 700);
    const y = h * (0.97 - progress * 0.08);

    ctx.save();
    ctx.translate(w / 2, y);
    ctx.globalAlpha = 0.7 + progress * 0.3;

    ctx.fillStyle = "#2b1b1b";
    ctx.beginPath();
    ctx.arc(0, 0, 24 + progress * 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e44c32";
    ctx.beginPath();
    ctx.arc(-8, -3, 4, 0, Math.PI * 2);
    ctx.arc(8, -3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function collision(obj) {
    const p = project(obj);
    const px = laneX(state.lane);
    const py = canvas.clientHeight * 0.79;
    const dx = Math.abs(p.x - px);
    const dy = Math.abs(p.y - py);

    return obj.z > 0.82 && obj.z < 1.02 && dx < 32 && dy < 55;
  }

  function hit() {
    if (performance.now() < state.invulnerableUntil) return;

    state.health -= 1;
    state.invulnerableUntil = performance.now() + 1400;
    state.speed = Math.max(4.5, state.speed - 0.5);
    updateHUD();
    emit("treasure:hit", { health: state.health });

    if (state.health <= 0) endRun();
  }

  function update(dt) {
    if (!state.running || state.paused) return;

    state.distance += state.speed * dt * 0.06;
    state.score += state.speed * dt * 0.08;
    state.speed += dt * 0.0007;
    player.bob += dt * 0.012;

    state.spawnTimer += dt;
    state.coinTimer += dt;

    const spawnEvery = Math.max(520, 1050 - state.distance * 0.25);
    if (state.spawnTimer >= spawnEvery) {
      state.spawnTimer = 0;
      const r = Math.random();
      spawn(r < 0.18 ? "obstacle" : r < 0.24 ? "gem" : "coin");
    }

    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      obj.z += obj.speed * dt * (state.speed / 6);

      if (collision(obj)) {
        if (obj.type === "coin") {
          addCoins(1);
          obj.collected = true;
        } else if (obj.type === "gem") {
          addGems(1);
          obj.collected = true;
        } else {
          hit();
          obj.collected = true;
        }
      }

      if (obj.collected || obj.z > 1.15) objects.splice(i, 1);
    }

    if (state.score > state.best) state.best = state.score;
    updateHUD();
  }

  function render() {
    drawBackground();
    objects.slice().sort((a, b) => a.z - b.z).forEach(drawObject);
    drawChaser();
    drawPlayer();

    if (!state.running) {
      ctx.fillStyle = "rgba(0,0,0,.28)";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
  }

  function loop(t) {
    const dt = Math.min(50, t - (state.lastTime || t));
    state.lastTime = t;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function startRun() {
    if (state.running) return;
    state.running = true;
    state.paused = false;
    state.health = 3;
    state.score = 0;
    state.distance = 0;
    state.speed = 6;
    state.lane = 1;
    state.targetLane = 1;
    objects.length = 0;
    state.spawnTimer = 0;
    state.coinTimer = 0;
    emit("treasure:run-start");
    updateHUD();
  }

  function endRun() {
    state.running = false;
    state.paused = false;
    state.best = Math.max(state.best, state.score);
    save();
    updateHUD();
    emit("treasure:run-complete", {
      score: Math.floor(state.score),
      coins: state.coins,
      gems: state.gems
    });
    toast(`🏁 Run complete • ${Math.floor(state.score)} score`);
  }

  function togglePause() {
    if (!state.running) return;
    state.paused = !state.paused;
    emit("treasure:pause", { paused: state.paused });
  }

  function moveLeft() {
    if (!state.running) return;
    state.targetLane = Math.max(0, state.targetLane - 1);
    state.lane = state.targetLane;
  }

  function moveRight() {
    if (!state.running) return;
    state.targetLane = Math.min(2, state.targetLane + 1);
    state.lane = state.targetLane;
  }

  function jump() {
    if (!state.running) return;
    emit("treasure:jump");
    toast("⬆ Jump");
  }

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") moveLeft();
    else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") moveRight();
    else if (e.key === "ArrowUp" || e.key === " ") jump();
    else if (e.key.toLowerCase() === "p") togglePause();
  });

  // Touch swipe
  let touchStartX = 0;
  let touchStartY = 0;
  canvas.addEventListener("touchstart", (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  canvas.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
      jump();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? moveLeft() : moveRight();
    } else if (dy < 0) {
      jump();
    }
  }, { passive: true });

  // Buttons work if matching data attributes exist in index.html.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === "play") startRun();
    if (action === "pause") togglePause();
    if (action === "left") moveLeft();
    if (action === "right") moveRight();
    if (action === "jump") jump();
    if (action === "spin") spin();
    if (action === "completed-ad") onCompletedAd();
  });

  window.TreasureRush.start = startRun;
  window.TreasureRush.pause = togglePause;
  window.TreasureRush.spin = spin;
  window.TreasureRush.moveLeft = moveLeft;
  window.TreasureRush.moveRight = moveRight;
  window.TreasureRush.jump = jump;
  window.TreasureRush.unlockSpinAfterCompletedAd = unlockSpinAfterCompletedAd;
  window.TreasureRush.config = CONFIG;

  updateHUD();
  requestAnimationFrame(loop);
})();
