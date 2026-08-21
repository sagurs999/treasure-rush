(() => {
  const $ = (s) => document.querySelector(s);

  let S = JSON.parse(localStorage.getItem("treasureRush") || "null") || {
    coins: 0,
    gems: 0,
    cash: 0,
    best: 0,
    runs: 0,
    level: 1,
    ads: 0
  };

  let screen = "home";
  let pending = null;

  const save = () => {
    localStorage.setItem("treasureRush", JSON.stringify(S));
    ui();
  };

  const money = (n) => "$" + Number(n || 0).toFixed(3);

  const toast = (message) => {
    const t = $("#toast");
    if (!t) return;

    t.textContent = message;
    t.classList.add("show");

    clearTimeout(toast.x);

    toast.x = setTimeout(() => {
      t.classList.remove("show");
    }, 2200);
  };

  function ui() {
    if ($("#coins")) $("#coins").textContent = Math.floor(S.coins);
    if ($("#gems")) $("#gems").textContent = Math.floor(S.gems);
    if ($("#cash")) $("#cash").textContent = money(S.cash);
    if ($("#best")) $("#best").textContent = Math.floor(S.best);
    if ($("#runs")) $("#runs").textContent = S.runs;
    if ($("#level")) $("#level").textContent = S.level;

    if ($("#withdrawCash")) {
      $("#withdrawCash").textContent = money(S.cash);
    }

    if ($("#pCoins")) $("#pCoins").textContent = Math.floor(S.coins);
    if ($("#pGems")) $("#pGems").textContent = Math.floor(S.gems);
    if ($("#pRuns")) $("#pRuns").textContent = S.runs;

    if ($("#adMission")) {
      $("#adMission").textContent = Math.min(S.ads, 3) + "/3";
    }

    if ($("#runMission")) {
      $("#runMission").textContent = Math.min(S.runs, 1) + "/1";
    }

    if ($("#coinMission")) {
      $("#coinMission").textContent =
        Math.min(S.coins, 100) + "/100";
    }

    if ($("#refLink")) {
      $("#refLink").value =
        location.origin +
        location.pathname +
        "?ref=RUNNER";
    }
  }

  ui();

  // -----------------------------
  // SCREEN NAVIGATION
  // -----------------------------

  function show(id) {
    document
      .querySelectorAll(".screen")
      .forEach((e) => e.classList.remove("active"));

    const target = $("#" + id);

    if (target) {
      target.classList.add("active");
    }

    screen = id;

    document
      .querySelectorAll(".nav")
      .forEach((e) => e.classList.remove("active"));

    const nav = document.querySelector(
      `.nav[data-target="${id}"]`
    );

    if (nav) {
      nav.classList.add("active");
    }
  }

  document.querySelectorAll("[data-target]").forEach((button) => {
    button.onclick = () => {
      show(button.dataset.target);
    };
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.onclick = () => show("home");
  });

  // -----------------------------
  // BUTTONS
  // -----------------------------

  if ($("#navSpin")) {
    $("#navSpin").onclick = () => show("spin");
  }

  if ($("#spinBtn")) {
    $("#spinBtn").onclick = () => show("spin");
  }

  if ($("#refBtn")) {
    $("#refBtn").onclick = () => show("referral");
  }

  if ($("#missionsBtn")) {
    $("#missionsBtn").onclick = () => show("missions");
  }

  if ($("#withdrawBtn")) {
    $("#withdrawBtn").onclick = () => show("withdraw");
  }

  if ($("#profileBtn")) {
    $("#profileBtn").onclick = () => show("profile");
  }

  if ($("#playBtn")) {
    $("#playBtn").onclick = () => startGame();
  }

  if ($("#pauseBtn")) {
    $("#pauseBtn").onclick = () => {
      G.paused = !G.paused;
    };
  }

  if ($("#resetBtn")) {
    $("#resetBtn").onclick = () => {
      localStorage.removeItem("treasureRush");
      location.reload();
    };
  }

  // -----------------------------
  // REFERRAL
  // -----------------------------

  if ($("#copyRef")) {
    $("#copyRef").onclick = async () => {
      try {
        await navigator.clipboard.writeText(
          $("#refLink").value
        );

        toast("Referral link copied");
      } catch (e) {
        toast("Copy failed");
      }
    };
  }

  if ($("#shareRef")) {
    $("#shareRef").onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: "Treasure Rush",
          text: "Join Treasure Rush!",
          url: $("#refLink").value
        });
      } else {
        toast("Copy your referral link");
      }
    };
  }

  // -----------------------------
  // WITHDRAW
  // Minimum = $25
  // -----------------------------

  if ($("#requestWithdraw")) {
    $("#requestWithdraw").onclick = () => {
      const amount = Number(
        $("#withdrawAmount").value
      );

      if (amount < 25) {
        return toast(
          "Minimum withdrawal is $25.00"
        );
      }

      if (amount > S.cash) {
        return toast(
          "Insufficient available balance"
        );
      }

      toast(
        "Withdrawal request sent for review"
      );
    };
  }

  // =====================================================
  // REWARDED AD SYSTEM
  // =====================================================

  /*
    IMPORTANT:

    Reward is NOT added when the user simply presses
    the ad button.

    Reward is added ONLY after adCompleted().

    Replace showRewardedAd() with your real
    Monetag rewarded-ad integration.
  */

  function showRewardedAd(callback) {
    pending = callback;

    if ($("#adOverlay")) {
      $("#adOverlay").classList.add("show");
    }

    if ($("#adStatus")) {
      $("#adStatus").textContent =
        "Waiting for a verified completed-ad event…";
    }
  }

  /*
    REAL AD PROVIDER SHOULD CALL THIS FUNCTION
    AFTER THE REWARDED AD IS ACTUALLY COMPLETED.
  */

  function adCompleted() {
    if (!pending) return;

    const callback = pending;

    pending = null;

    if ($("#adOverlay")) {
      $("#adOverlay").classList.remove("show");
    }

    callback();
  }

  window.adCompleted = adCompleted;

  // Demo testing button
  if ($("#adDemoComplete")) {
    $("#adDemoComplete").onclick =
      adCompleted;
  }

  // =====================================================
  // WATCH AD & EARN
  // +20 COINS
  // =====================================================

  if ($("#adBtn")) {
    $("#adBtn").onclick = () => {

      showRewardedAd(() => {

        S.coins += 20;

        S.ads += 1;

        save();

        toast(
          "+20 Coins — completed ad verified"
        );

      });

    };
  }

  // =====================================================
  // SPIN REWARDS
  // =====================================================

  const REWARDS = [

    {
      label: "20 COINS",
      coins: 20,
      gems: 0,
      cash: 0
    },

    {
      label: "50 COINS",
      coins: 50,
      gems: 0,
      cash: 0
    },

    {
      label: "100 COINS",
      coins: 100,
      gems: 0,
      cash: 0
    },

    {
      label: "10 💎",
      coins: 0,
      gems: 10,
      cash: 0
    },

    {
      label: "30 💎",
      coins: 0,
      gems: 30,
      cash: 0
    },

    {
      label: "50 💎",
      coins: 0,
      gems: 50,
      cash: 0
    },

    {
      label: "$0.020",
      coins: 0,
      gems: 0,
      cash: 0.020
    }

  ];

  const W = $("#wheel");

  let X = null;

  if (W) {
    X = W.getContext("2d");
  }

  let angle = 0;
  let spinning = false;

  // =====================================================
  // DRAW SPIN WHEEL
  // =====================================================

  function drawWheel() {

    if (!X) return;

    X.clearRect(
      0,
      0,
      320,
      320
    );

    const segment =
      (Math.PI * 2) /
      REWARDS.length;

    X.save();

    X.translate(160, 160);

    X.rotate(angle);

    REWARDS.forEach(
      (reward, index) => {

        X.beginPath();

        X.moveTo(0, 0);

        X.arc(
          0,
          0,
          150,
          index * segment,
          (index + 1) * segment
        );

        X.closePath();

        X.fillStyle =
          index % 2
            ? "#0d7968"
            : "#154b62";

        X.fill();

        X.strokeStyle =
          "#ffd65a";

        X.lineWidth = 2;

        X.stroke();

        X.save();

        X.rotate(
          index * segment +
          segment / 2
        );

        X.textAlign = "right";

        X.fillStyle = "#fff";

        X.font =
          "900 13px system-ui";

        X.fillText(
          reward.label,
          136,
          5
        );

        X.restore();
      }
    );

    X.restore();

    // Center

    X.beginPath();

    X.arc(
      160,
      160,
      30,
      0,
      Math.PI * 2
    );

    X.fillStyle =
      "#07151d";

    X.fill();

    X.strokeStyle =
      "#f5ce56";

    X.stroke();

    X.fillStyle =
      "#f5ce56";

    X.font =
      "900 13px system-ui";

    X.textAlign =
      "center";

    X.fillText(
      "GO",
      160,
      165
    );
  }

  drawWheel();

  // =====================================================
  // SPIN
  // =====================================================

  if ($("#spinNow")) {

    $("#spinNow").onclick = () => {

      if (spinning) return;

      spinning = true;

      $("#spinNow").disabled =
        true;

      const index =
        Math.floor(
          Math.random() *
          REWARDS.length
        );

      const segment =
        (Math.PI * 2) /
        REWARDS.length;

      const start = angle;

      const end =
        -(index * segment +
          segment / 2) +
        14 * Math.PI;

      const startTime =
        performance.now();

      function animate(now) {

        const progress =
          Math.min(
            1,
            (now - startTime) /
              3600
          );

        const easing =
          1 -
          Math.pow(
            1 - progress,
            4
          );

        angle =
          start +
          (end - start) *
            easing;

        drawWheel();

        if (progress < 1) {

          requestAnimationFrame(
            animate
          );

        } else {

          angle =
            angle %
            (Math.PI * 2);

          /*
            IMPORTANT:

            Save the EXACT reward object.

            This prevents the bug where
            50 reward displays as 100.
          */

          const reward =
            REWARDS[index];

          pending = {
            spin: true,
            reward: {
              label: reward.label,
              coins: reward.coins,
              gems: reward.gems,
              cash: reward.cash
            }
          };

          if ($("#spinResult")) {
            $("#spinResult").textContent =
              "You won: " +
              reward.label;
          }

          spinning = false;

          $("#spinNow").disabled =
            false;

          toast(
            "Reward ready — complete the ad to claim"
          );

          setTimeout(
            claimSpinReward,
            250
          );
        }
      }

      requestAnimationFrame(
        animate
      );
    };
  }

  // =====================================================
  // CLAIM SPIN REWARD
  // AD MUST COMPLETE FIRST
  // =====================================================

  function claimSpinReward() {

    if (
      !pending ||
      !pending.spin
    ) {
      return;
    }

    const reward =
      pending.reward;

    showRewardedAd(() => {

      /*
        EXACT REWARD CREDIT
      */

      S.coins +=
        Number(
          reward.coins || 0
        );

      S.gems +=
        Number(
          reward.gems || 0
        );

      S.cash +=
        Number(
          reward.cash || 0
        );

      pending = null;

      save();

      toast(
        "Claimed: " +
        reward.label
      );

    });
  }

  // =====================================================
  // RUNNER GAME
  // =====================================================

  const canvas =
    $("#gameCanvas");

  let ctx = null;

  if (canvas) {
    ctx =
      canvas.getContext("2d");
  }

  let G = {

    running: false,

    paused: false,

    lane: 1,

    y: 0,

    velocityY: 0,

    hp: 3,

    coins: 0,

    gems: 0,

    score: 0,

    speed: 5,

    obstacles: [],

    spawnTimer: 0,

    lastTime: 0

  };

  // =====================================================
  // CANVAS RESIZE
  // =====================================================

  function resizeCanvas() {

    if (!canvas || !ctx) {
      return;
    }

    const d =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    canvas.width =
      window.innerWidth * d;

    canvas.height =
      window.innerHeight * d;

    ctx.setTransform(
      d,
      0,
      0,
      d,
      0,
      0
    );
  }

  window.addEventListener(
    "resize",
    resizeCanvas
  );

  resizeCanvas();

  // =====================================================
  // LANE POSITION
  // =====================================================

  function laneX(lane) {

    return (
      window.innerWidth *
      (
        0.28 +
        lane * 0.22
      )
    );
  }

  // =====================================================
  // START GAME
  // =====================================================

  function startGame() {

    show("game");

    G = {

      running: true,

      paused: false,

      lane: 1,

      y: 0,

      velocityY: 0,

      hp: 3,

      coins: 0,

      gems: 0,

      score: 0,

      speed: 5,

      obstacles: [],

      spawnTimer: 0,

      lastTime:
        performance.now()

    };

    requestAnimationFrame(
      gameLoop
    );
  }

  // =====================================================
  // MOVEMENT
  // =====================================================

  function moveLane(direction) {

    G.lane =
      Math.max(
        0,
        Math.min(
          2,
          G.lane + direction
        )
      );
  }

  function jump() {

    if (G.y === 0) {

      G.velocityY = 12;

    }

  }

  // Control buttons

  document
    .querySelectorAll("[data-dir]")
    .forEach((button) => {

      button.onpointerdown =
        () => {

          const direction =
            button.dataset.dir;

          if (
            direction ===
            "left"
          ) {

            moveLane(-1);

          } else if (
            direction ===
            "right"
          ) {

            moveLane(1);

          } else if (
            direction ===
            "jump"
          ) {

            jump();

          }

        };

    });

  // =====================================================
  // TOUCH SWIPE
  // =====================================================

  let touchStartX = 0;
  let touchStartY = 0;

  if (canvas) {

    canvas.addEventListener(
      "touchstart",
      (event) => {

        touchStartX =
          event.touches[0]
            .clientX;

        touchStartY =
          event.touches[0]
            .clientY;

      },
      {
        passive: true
      }
    );

    canvas.addEventListener(
      "touchend",
      (event) => {

        const dx =
          event.changedTouches[0]
            .clientX -
          touchStartX;

        const dy =
          event.changedTouches[0]
            .clientY -
          touchStartY;

        if (
          Math.abs(dx) > 35
        ) {

          moveLane(
            dx > 0
              ? 1
              : -1
          );

        } else if (
          dy < -25
        ) {

          jump();

        }

      },
      {
        passive: true
      }
    );

  }

  // =====================================================
  // KEYBOARD
  // =====================================================

  window.addEventListener(
    "keydown",
    (event) => {

      if (
        screen !== "game"
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {

        moveLane(-1);

      }

      if (
        event.key ===
        "ArrowRight"
      ) {

        moveLane(1);

      }

      if (
        event.key ===
          "ArrowUp" ||
        event.key === " "
      ) {

        jump();

      }

    }
  );

  // =====================================================
  // SPAWN OBJECT
  // =====================================================

  function spawnObject() {

    const random =
      Math.random();

    let type;

    if (random < 0.55) {

      type = "coin";

    } else if (
      random < 0.72
    ) {

      type = "gem";

    } else {

      type = "rock";

    }

    G.obstacles.push({

      type,

      lane:
        Math.floor(
          Math.random() * 3
        ),

      z: 1

    });

  }

  // =====================================================
  // DRAW GAME
  // =====================================================

  function drawGame() {

    if (!ctx) {
      return;
    }

    const width =
      window.innerWidth;

    const height =
      window.innerHeight;

    // Sky

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        height
      );

    gradient.addColorStop(
      0,
      "#07192c"
    );

    gradient.addColorStop(
      0.5,
      "#155364"
    );

    gradient.addColorStop(
      1,
      "#173e2d"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    // Moon

    ctx.fillStyle =
      "#ffe08a";

    ctx.beginPath();

    ctx.arc(
      width * 0.78,
      height * 0.16,
      31,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Mountains

    ctx.fillStyle =
      "#102f38";

    ctx.beginPath();

    ctx.moveTo(
      0,
      height * 0.42
    );

    for (
      let x = 0;
      x <= width;
      x += 70
    ) {

      ctx.lineTo(
        x,
        height * 0.31 +
          Math.sin(
            x * 0.02
          ) *
            28
      );

    }

    ctx.lineTo(
      width,
      height * 0.55
    );

    ctx.lineTo(
      0,
      height * 0.55
    );

    ctx.fill();

    // Jungle pillars

    for (
      let x = 20;
      x < width;
      x += 95
    ) {

      ctx.fillStyle =
        "#47513e";

      ctx.fillRect(
        x,
        height * 0.36,
        18,
        height * 0.28
      );

      ctx.fillStyle =
        "#29362f";

      ctx.fillRect(
        x - 6,
        height * 0.35,
        30,
        9
      );

    }

    // Road

    ctx.fillStyle =
      "#173e36";

    ctx.beginPath();

    ctx.moveTo(
      width * 0.38,
      height * 0.37
    );

    ctx.lineTo(
      width * 0.62,
      height * 0.37
    );

    ctx.lineTo(
      width * 0.98,
      height
    );

    ctx.lineTo(
      width * 0.02,
      height
    );

    ctx.fill();

    // Road lanes

    ctx.strokeStyle =
      "#2d8c6d";

    ctx.lineWidth = 3;

    for (
      let i = 0;
      i < 3;
      i++
    ) {

      ctx.beginPath();

      ctx.moveTo(
        width *
          (
            0.04 +
            i * 0.31
          ),
        height
      );

      ctx.lineTo(
        width *
          (
            0.38 +
            i * 0.12
          ),
        height * 0.37
      );

      ctx.stroke();

    }

    // Objects

    G.obstacles.forEach(
      (object) => {

        const y =
          height * 0.37 +
          (1 - object.z) *
            height *
            0.63;

        const scale =
          0.25 +
          (1 - object.z) *
            1.1;

        ctx.font =
          `${Math.max(
            10,
            25 * scale
          )}px system-ui`;

        ctx.textAlign =
          "center";

        let icon = "🪙";

        if (
          object.type ===
          "gem"
        ) {

          icon = "💎";

        } else if (
          object.type ===
          "rock"
        ) {

          icon = "🪨";

        }

        ctx.fillText(
          icon,
          laneX(
            object.lane
          ),
          y
        );

      }
    );

    // Character

    const characterX =
      laneX(G.lane);

    const characterY =
      height * 0.78 -
      G.y;

    // Shadow

    ctx.fillStyle =
      "#0008";

    ctx.beginPath();

    ctx.ellipse(
      characterX,
      characterY + 26,
      24,
      8,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Head

    ctx.fillStyle =
      "#ca8c62";

    ctx.beginPath();

    ctx.arc(
      characterX,
      characterY - 52,
      16,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Body

    ctx.fillStyle =
      "#205b76";

    ctx.fillRect(
      characterX - 18,
      characterY - 37,
      36,
      49
    );

    // Arms

    ctx.fillStyle =
      "#ca8c62";

    ctx.fillRect(
      characterX - 25,
      characterY - 30,
      9,
      35
    );

    ctx.fillRect(
      characterX + 16,
      characterY - 30,
      9,
      35
    );

    // Legs

    ctx.fillStyle =
      "#17212d";

    ctx.fillRect(
      characterX - 15,
      characterY + 11,
      12,
      36
    );

    ctx.fillRect(
      characterX + 4,
      characterY + 11,
      12,
      36
    );

  }

  // =====================================================
  // GAME LOOP
  // =====================================================

  function gameLoop(now) {

    if (!G.running) {
      return;
    }

    const dt =
      Math.min(
        0.035,
        (now - G.lastTime) /
          1000
      );

    G.lastTime = now;

    if (!G.paused) {

      G.score +=
        dt *
        G.speed *
        10;

      G.spawnTimer -= dt;

      if (
        G.spawnTimer <= 0
      ) {

        spawnObject();

        G.spawnTimer =
          0.65 -
          Math.min(
            0.35,
            G.score / 5000
          );

      }

      // Jump physics

      G.y +=
        G.velocityY *
        dt *
        60;

      G.velocityY -=
        0.65 *
        dt *
        60;

      if (G.y < 0) {

        G.y = 0;

        G.velocityY = 0;

      }

      // Objects movement

      G.obstacles =
        G.obstacles.filter(
          (object) => {

            object.z -=
              dt *
              G.speed *
              0.11;

            if (
              object.z < 0.07
            ) {

              if (
                object.lane ===
                  G.lane &&
                G.y < 45
              ) {

                // Coin

                if (
                  object.type ===
                  "coin"
                ) {

                  G.coins++;

                  S.coins++;

                }

                // Gem

                else if (
                  object.type ===
                  "gem"
                ) {

                  G.gems++;

                  S.gems++;

                }

                // Rock / obstacle

                else {

                  G.hp--;

                  if (
                    G.hp <= 0
                  ) {

                    endGame();

                    return false;

                  }

                }

              }

              return false;

            }

            return true;

          }
        );

      // HUD

      if ($("#health")) {
        $("#health").textContent =
          G.hp;
      }

      if ($("#gameCoins")) {
        $("#gameCoins").textContent =
          G.coins;
      }

      if ($("#gameGems")) {
        $("#gameGems").textContent =
          G.gems;
      }

      if ($("#score")) {
        $("#score").textContent =
          Math.floor(
            G.score
          );
      }

    }

    drawGame();

    requestAnimationFrame(
      gameLoop
    );
  }

  // =====================================================
  // GAME END
  // =====================================================

  function endGame() {

    G.running = false;

    S.runs++;

    S.best =
      Math.max(
        S.best,
        Math.floor(
          G.score
        )
      );

    S.level =
      Math.max(
        1,
        Math.floor(
          S.runs / 3
        ) + 1
      );

    save();

    toast(
      "Run complete • +" +
      G.coins +
      " coins"
    );

    setTimeout(
      () => show("home"),
      900
    );
  }

})();
