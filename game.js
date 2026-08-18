"use strict";

/* =========================================================
   TREASURE RUSH
   Telegram Mini Game - MVP
   ========================================================= */

/* -------------------------
   GAME SETTINGS
------------------------- */

const W = 900;
const H = 600;

const ROUND = 120;

// 20,000 Coins = $1
const COINS_PER_DOLLAR = 20000;

// Minimum withdrawal = $100
const MIN_WITHDRAW_DOLLARS = 100;

// Therefore:
const MIN_WITHDRAW_COINS =
  COINS_PER_DOLLAR * MIN_WITHDRAW_DOLLARS;


/* -------------------------
   PLAYER DATA
------------------------- */

const stats = {

  coins: 0,

  gems: 0,

  score: 0,

  games: 0,

  best: 0,

  referrals: 0,

  // Referral cash is separate
  refCash: 0

};


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function txt(
  scene,
  text,
  x,
  y,
  size = 24,
  color = "#ffffff"
) {

  return scene.add.text(
    x,
    y,
    text,
    {
      fontFamily: "Arial",
      fontSize: size + "px",
      fontStyle: "bold",
      color: color
    }
  ).setOrigin(0.5);

}


function panel(
  scene,
  x,
  y,
  width,
  height,
  color = 0x18382b
) {

  const g = scene.add.graphics();

  g.fillStyle(color, 1);

  g.fillRoundedRect(
    x - width / 2,
    y - height / 2,
    width,
    height,
    20
  );

  return g;
}


function button(
  scene,
  x,
  y,
  width,
  height,
  text,
  color,
  callback
) {

  const g = panel(
    scene,
    x,
    y,
    width,
    height,
    color
  );

  txt(
    scene,
    text,
    x,
    y,
    25
  );

  g.setInteractive(
    new Phaser.Geom.Rectangle(
      x - width / 2,
      y - height / 2,
      width,
      height
    ),
    Phaser.Geom.Rectangle.Contains
  );

  g.on("pointerdown", callback);

  return g;
}


function coinValue() {

  return stats.coins / COINS_PER_DOLLAR;

}


/* =========================================================
   MENU
   ========================================================= */

class Menu extends Phaser.Scene {

  constructor() {

    super("Menu");

  }


  create() {

    this.cameras.main.setBackgroundColor("#123b2a");


    /* Background decoration */

    for (let i = 0; i < 35; i++) {

      this.add.circle(
        Phaser.Math.Between(15, W - 15),
        Phaser.Math.Between(15, H - 15),
        Phaser.Math.Between(8, 25),
        0x1d6b40,
        0.7
      );

    }


    /* Logo */

    txt(
      this,
      "TREASURE",
      W / 2,
      70,
      55,
      "#ffd84d"
    );

    txt(
      this,
      "RUSH",
      W / 2,
      125,
      60,
      "#4ec8ff"
    );


    /* Balance panel */

    panel(
      this,
      W / 2,
      220,
      650,
      100
    );

    txt(
      this,
      "🪙 " + stats.coins,
      W / 2 - 190,
      220,
      27,
      "#ffd84d"
    );

    txt(
      this,
      "💎 " + stats.gems,
      W / 2,
      220,
      25,
      "#aee5ff"
    );

    txt(
      this,
      "🏆 " + stats.best,
      W / 2 + 180,
      220,
      23
    );


    /* Play */

    button(
      this,
      W / 2,
      330,
      390,
      70,
      "▶ PLAY",
      0x39b54a,
      () => {
        this.scene.start("Game");
      }
    );


    /* Menu buttons */

    button(
      this,
      180,
      440,
      250,
      58,
      "🎯 MISSIONS",
      0x286090,
      () => {
        this.scene.start("Missions");
      }
    );


    button(
      this,
      450,
      440,
      250,
      58,
      "🏅 LEADERBOARD",
      0x8a5b20,
      () => {
        this.scene.start("Leaderboard");
      }
    );


    button(
      this,
      720,
      440,
      250,
      58,
      "👤 PROFILE",
      0x6744a8,
      () => {
        this.scene.start("Profile");
      }
    );


    /* Withdraw */

    button(
      this,
      W / 2,
      515,
      300,
      52,
      "💸 WITHDRAW",
      0x9a3b3b,
      () => {
        this.scene.start("Withdraw");
      }
    );


    txt(
      this,
      "20,000 Coins = $1 • Withdraw at $100",
      W / 2,
      575,
      17,
      "#9cc7ad"
    );

  }

}


/* =========================================================
   GAME
   ========================================================= */

class Game extends Phaser.Scene {

  constructor() {

    super("Game");

  }


  create() {

    this.coins = 0;

    this.gems = 0;

    this.score = 0;

    this.left = ROUND;


    /* Map */

    this.add.rectangle(
      W / 2,
      H / 2,
      W,
      H,
      0x2d7d42
    );


    /* Trees / decoration */

    for (let i = 0; i < 24; i++) {

      const x =
        Phaser.Math.Between(
          20,
          W - 20
        );

      const y =
        Phaser.Math.Between(
          80,
          H - 20
        );

      this.add.circle(
        x,
        y,
        Phaser.Math.Between(15, 27),
        0x176338,
        0.9
      );

      this.add.circle(
        x,
        y - 8,
        Phaser.Math.Between(8, 16),
        0x2e9b51,
        0.9
      );

    }


    /* Coins */

    for (let i = 0; i < 30; i++) {

      this.spawn("coin");

    }


    /* Gems */

    for (let i = 0; i < 5; i++) {

      this.spawn("gem");

    }


    /* Treasure chests */

    for (let i = 0; i < 2; i++) {

      this.spawn("chest");

    }


    /* Player */

    this.player =
      this.add.circle(
        W / 2,
        H / 2,
        22,
        0xffb347
      );


    /* Keyboard */

    this.keys =
      this.input.keyboard.addKeys(
        "W,S,A,D"
      );


    /* HUD */

    panel(
      this,
      150,
      35,
      240,
      52,
      0x14251d
    );

    panel(
      this,
      470,
      35,
      220,
      52,
      0x14251d
    );

    panel(
      this,
      760,
      35,
      230,
      52,
      0x14251d
    );


    this.timer =
      txt(
        this,
        "⏱ 2:00",
        150,
        35,
        22
      );


    this.coinTxt =
      txt(
        this,
        "🪙 0",
        400,
        35,
        22,
        "#ffd84d"
      );


    this.scoreTxt =
      txt(
        this,
        "⭐ 0",
        520,
        35,
        22,
        "#fff3a1"
      );


    this.gemTxt =
      txt(
        this,
        "💎 0",
        610,
        35,
        22,
        "#aee5ff"
      );


    /* =====================================================
       MOBILE JOYSTICK
    ===================================================== */

    this.jBase =
      this.add.circle(
        90,
        520,
        58,
        0xffffff,
        0.14
      )
      .setStrokeStyle(
        3,
        0xffffff,
        0.3
      );


    this.jKnob =
      this.add.circle(
        90,
        520,
        27,
        0xffffff,
        0.35
      );


    this.jActive = false;

    this.jv =
      new Phaser.Math.Vector2(
        0,
        0
      );


    this.input.on(
      "pointerdown",
      pointer => {

        if (
          pointer.x < 220 &&
          pointer.y > 450
        ) {

          this.jActive = true;

        }

      }
    );


    this.input.on(
      "pointermove",
      pointer => {

        if (!this.jActive) {
          return;
        }

        const dx =
          Phaser.Math.Clamp(
            pointer.x - 90,
            -45,
            45
          );

        const dy =
          Phaser.Math.Clamp(
            pointer.y - 520,
            -45,
            45
          );


        this.jKnob.setPosition(
          90 + dx,
          520 + dy
        );


        this.jv.set(
          dx / 45,
          dy / 45
        );

      }
    );


    this.input.on(
      "pointerup",
      () => {

        this.jActive = false;

        this.jKnob.setPosition(
          90,
          520
        );

        this.jv.set(
          0,
          0
        );

      }
    );


    /* =====================================================
       TIMER
    ===================================================== */

    this.timerEvent =
      this.time.addEvent({

        delay: 1000,

        loop: true,

        callback: () => {

          this.left--;

          this.hud();

          if (this.left <= 0) {

            this.finish();

          }

        }

      });

  }


  /* -------------------------
     SPAWN OBJECT
  ------------------------- */

  spawn(type) {

    const x =
      Phaser.Math.Between(
        35,
        W - 35
      );

    const y =
      Phaser.Math.Between(
        90,
        H - 30
      );

    let object;


    if (type === "coin") {

      object =
        this.add.circle(
          x,
          y,
          12,
          0xffd447
        );

    }


    if (type === "gem") {

      object =
        this.add.polygon(
          x,
          y,
          [
            0, -15,
            13, 0,
            0, 15,
            -13, 0
          ],
          0x9c5cff
        );

    }


    if (type === "chest") {

      object =
        this.add.rectangle(
          x,
          y,
          34,
          26,
          0x9a5a25
        );

    }


    object.kind = type;

  }


  /* -------------------------
     UPDATE
  ------------------------- */

  update() {

    if (!this.player) {
      return;
    }


    const velocity =
      this.jv.clone();


    if (this.keys.A.isDown) {
      velocity.x--;
    }

    if (this.keys.D.isDown) {
      velocity.x++;
    }

    if (this.keys.W.isDown) {
      velocity.y--;
    }

    if (this.keys.S.isDown) {
      velocity.y++;
    }


    if (velocity.lengthSq()) {

      velocity.normalize();


      this.player.x =
        Phaser.Math.Clamp(
          this.player.x +
          velocity.x * 4,
          25,
          W - 25
        );


      this.player.y =
        Phaser.Math.Clamp(
          this.player.y +
          velocity.y * 4,
          80,
          H - 25
        );

    }


    /* Collect items */

    this.children.list
      .filter(
        object =>
          object.kind
      )
      .forEach(
        object => {

          if (
            Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              object.x,
              object.y
            ) < 32
          ) {


            if (
              object.kind === "coin"
            ) {

              this.coins++;

              this.score += 10;

            }


            if (
              object.kind === "gem"
            ) {

              this.gems++;

              this.score += 50;

            }


            if (
              object.kind === "chest"
            ) {

              this.coins += 10;

              this.score += 100;

            }


            object.destroy();

            this.hud();

          }

        }
      );

  }


  /* -------------------------
     HUD
  ------------------------- */

  hud() {

    this.timer.setText(
      "⏱ " +
      Math.floor(this.left / 60) +
      ":" +
      String(
        this.left % 60
      ).padStart(2, "0")
    );


    this.coinTxt.setText(
      "🪙 " + this.coins
    );


    this.gemTxt.setText(
      "💎 " + this.gems
    );


    this.scoreTxt.setText(
      "⭐ " + this.score
    );

  }


  /* -------------------------
     FINISH ROUND
  ------------------------- */

  finish() {

    if (this.timerEvent) {

      this.timerEvent.remove(false);

    }


    stats.coins += this.coins;

    stats.gems += this.gems;

    stats.games++;

    stats.best =
      Math.max(
        stats.best,
        this.score
      );


    this.scene.start(
      "Result",
      {
        coins: this.coins,
        gems: this.gems,
        score: this.score
      }
    );

  }

}


/* =========================================================
   RESULT
   ========================================================= */

class Result extends Phaser.Scene {

  constructor() {

    super("Result");

  }


  create(data) {

    this.cameras.main.setBackgroundColor(
      "#123b2a"
    );


    txt(
      this,
      "🏆 ROUND COMPLETE",
      W / 2,
      95,
      42,
      "#ffd84d"
    );


    panel(
      this,
      W / 2,
      250,
      560,
      250
    );


    txt(
      this,
      "🪙 +" +
      data.coins +
      " Coins",
      W / 2,
      180,
      27,
      "#ffd84d"
    );


    txt(
      this,
      "💎 +" +
      data.gems +
      " Gems",
      W / 2,
      225,
      25,
      "#aee5ff"
    );


    txt(
      this,
      "⭐ " +
      data.score +
      " Score",
      W / 2,
      270,
      27,
      "#fff3a1"
    );


    txt(
      this,
      "Total Coins: " +
      stats.coins,
      W / 2,
      315,
      22
    );


    button(
      this,
      W / 2,
      405,
      350,
      62,
      "▶ PLAY AGAIN",
      0x39b54a,
      () => {
        this.scene.start("Game");
      }
    );


    button(
      this,
      W / 2,
      480,
      280,
      55,
      "⌂ HOME",
      0x286090,
      () => {
        this.scene.start("Menu");
      }
    );

  }

}


/* =========================================================
   WITHDRAW
   ========================================================= */

class Withdraw extends Phaser.Scene {

  constructor() {

    super("Withdraw");

  }


  create() {

    this.cameras.main.setBackgroundColor(
      "#0d241c"
    );


    txt(
      this,
      "💸 WITHDRAW",
      W / 2,
      65,
      42,
      "#ffd84d"
    );


    panel(
      this,
      W / 2,
      190,
      620,
      190
    );


    txt(
      this,
      "Available Coin Balance",
      W / 2,
      120,
      20,
      "#b7d8c4"
    );


    txt(
      this,
      "🪙 " +
      stats.coins,
      W / 2,
      160,
      32,
      "#ffd84d"
    );


    txt(
      this,
      "Withdrawal Value",
      W / 2,
      210,
      19,
      "#b7d8c4"
    );


    txt(
      this,
      "$" +
      coinValue().toFixed(2),
      W / 2,
      250,
      40,
      "#71e0a0"
    );


    txt(
      this,
      "Minimum withdrawal: $100",
      W / 2,
      295,
      18,
      "#ffb6b6"
    );


    txt(
      this,
      "Withdrawal Methods",
      W / 2,
      355,
      22
    );


    button(
      this,
      330,
      420,
      210,
      55,
      "PayPal",
      0x286090,
      () => {
        this.notice(
          "PayPal selected"
        );
      }
    );


    button(
      this,
      570,
      420,
      210,
      55,
      "Crypto",
      0x6744a8,
      () => {
        this.notice(
          "Crypto selected"
        );
      }
    );


    button(
      this,
      810,
      420,
      210,
      55,
      "Other",
      0x8a5b20,
      () => {
        this.notice(
          "Other selected"
        );
      }
    );


    button(
      this,
      W / 2,
      510,
      300,
      55,
      "REQUEST WITHDRAW",
      0x9a3b3b,
      () => {

        if (
          stats.coins >=
          MIN_WITHDRAW_COINS
        ) {

          this.notice(
            "Withdrawal request submitted"
          );

        } else {

          this.notice(
            "Need " +
            MIN_WITHDRAW_COINS.toLocaleString() +
            " Coins"
          );

        }

      }
    );


    button(
      this,
      100,
      560,
      150,
      42,
      "← BACK",
      0x286090,
      () => {
        this.scene.start("Menu");
      }
    );

  }


  notice(message) {

    const notification =
      txt(
        this,
        message,
        W / 2,
        570,
        18,
        "#ffffff"
      );


    this.time.delayedCall(
      1800,
      () => {

        notification.destroy();

      }
    );

  }

}


/* =========================================================
   PROFILE
   ========================================================= */

class Profile extends Phaser.Scene {

  constructor() {

    super("Profile");

  }


  create() {

    this.cameras.main.setBackgroundColor(
      "#123b2a"
    );


    txt(
      this,
      "👤 PROFILE",
      W / 2,
      70,
      42,
      "#ffd84d"
    );


    panel(
      this,
      W / 2,
      260,
      600,
      380
    );


    txt(
      this,
      "Telegram Player",
      W / 2,
      135,
      25
    );


    txt(
      this,
      "🪙 Coins: " +
      stats.coins,
      W / 2,
      195,
      26,
      "#ffd84d"
    );


    txt(
      this,
      "💎 Gems: " +
      stats.gems,
      W / 2,
      240,
      24,
      "#aee5ff"
    );


    txt(
      this,
      "🎮 Games: " +
      stats.games,
      W / 2,
      285,
      23
    );


    txt(
      this,
      "🏆 Best Score: " +
      stats.best,
      W / 2,
      330,
      23
    );


    txt(
      this,
      "👥 Referrals: " +
      stats.referrals,
      W / 2,
      375,
      23
    );


    txt(
      this,
      "💵 Referral: $" +
      stats.refCash.toFixed(3),
      W / 2,
      420,
      23,
      "#71e0a0"
    );


    button(
      this,
      W / 2,
      500,
      280,
      55,
      "💸 WITHDRAW",
      0x9a3b3b,
      () => {
        this.scene.start("Withdraw");
      }
    );


    button(
      this,
      100,
      560,
      150,
      42,
      "← HOME",
      0x286090,
      () => {
        this.scene.start("Menu");
      }
    );

  }

}


/* =========================================================
   MISSIONS
   ========================================================= */

class Missions extends Phaser.Scene {

  constructor() {

    super("Missions");

  }


  create() {

    this.cameras.main.setBackgroundColor(
      "#123b2a"
    );


    txt(
      this,
      "🎯 DAILY MISSIONS",
      W / 2,
      70,
      40,
      "#ffd84d"
    );


    panel(
      this,
      W / 2,
      275,
      650,
      390
    );


    txt(
      this,
      "Collect 100 Coins",
      W / 2,
      155,
      25
    );


    txt(
      this,
      "Reward: +500 Coins",
      W / 2,
      195,
      21,
      "#ffd84d"
    );


    txt(
      this,
      "Play 3 Games",
      W / 2,
      260,
      25
    );


    txt(
      this,
      "Reward: +1,000 Coins",
      W / 2,
      300,
      21,
      "#ffd84d"
    );


    txt(
      this,
      "Find 1 Treasure Chest",
      W / 2,
      365,
      25
    );


    txt(
      this,
      "Reward: +2,000 Coins",
      W / 2,
      405,
      21,
      "#ffd84d"
    );


    button(
      this,
      W / 2,
      500,
      280,
      55,
      "← HOME",
      0x286090,
      () => {
        this.scene.start("Menu");
      }
    );

  }

}


/* =========================================================
   LEADERBOARD
   ========================================================= */

class Leaderboard extends Phaser.Scene {

  constructor() {

    super("Leaderboard");

  }


  create() {

    this.cameras.main.setBackgroundColor(
      "#123b2a"
    );


    txt(
      this,
      "🏅 LEADERBOARD",
      W / 2,
      70,
      42,
      "#ffd84d"
    );


    panel(
      this,
      W / 2,
      285,
      620,
      390
    );


    const players = [

      [
        "1",
        "Alex",
        "25,000"
      ],

      [
        "2",
        "Emma",
        "22,500"
      ],

      [
        "3",
        "John",
        "21,700"
      ],

      [
        "4",
        "You",
        String(stats.best)
      ]

    ];


    players.forEach(
      (row, index) => {

        txt(
          this,
          row[0] +
          ".  " +
          row[1],
          W / 2 - 170,
          160 + index * 65,
          24,
          index === 3
            ? "#71e0a0"
            : "#ffffff"
        );


        txt(
          this,
          row[2],
          W / 2 + 160,
          160 + index * 65,
          24,
          "#ffd84d"
        );

      }
    );


    button(
      this,
      W / 2,
      500,
      280,
      55,
      "← HOME",
      0x286090,
      () => {
        this.scene.start("Menu");
      }
    );

  }

}


/* =========================================================
   IMPORTANT
   PHASER MUST START AFTER ALL CLASSES ARE CREATED
   ========================================================= */

const config = {

  type: Phaser.AUTO,

  parent: "game-container",

  width: W,

  height: H,

  backgroundColor: "#102a20",

  scale: {

    mode: Phaser.Scale.FIT,

    autoCenter:
      Phaser.Scale.CENTER_BOTH

  },

  scene: [

    Menu,

    Game,

    Result,

    Withdraw,

    Profile,

    Missions,

    Leaderboard

  ]

};


/* START GAME */

new Phaser.Game(config);
