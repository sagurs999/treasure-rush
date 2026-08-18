"use strict";

const W = 900;
const H = 600;

class Menu extends Phaser.Scene {

  constructor() {
    super("Menu");
  }

  create() {

    this.cameras.main.setBackgroundColor("#123b2a");

    this.add.text(
      W / 2,
      100,
      "TREASURE RUSH",
      {
        fontFamily: "Arial",
        fontSize: "60px",
        fontStyle: "bold",
        color: "#ffd84d"
      }
    ).setOrigin(0.5);

    this.add.text(
      W / 2,
      180,
      "🎉 GAME IS WORKING!",
      {
        fontFamily: "Arial",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

    this.add.text(
      W / 2,
      250,
      "Telegram Treasure Hunt",
      {
        fontFamily: "Arial",
        fontSize: "25px",
        color: "#4ec8ff"
      }
    ).setOrigin(0.5);

    const button = this.add.rectangle(
      W / 2,
      370,
      350,
      80,
      0x39b54a
    );

    button.setInteractive();

    this.add.text(
      W / 2,
      370,
      "▶ PLAY",
      {
        fontFamily: "Arial",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

    button.on("pointerdown", () => {

      this.scene.start("Game");

    });

  }

}


class Game extends Phaser.Scene {

  constructor() {
    super("Game");
  }

  create() {

    this.cameras.main.setBackgroundColor("#2d7d42");

    this.add.text(
      W / 2,
      100,
      "🏴‍☠️ TREASURE HUNT",
      {
        fontFamily: "Arial",
        fontSize: "45px",
        fontStyle: "bold",
        color: "#ffd84d"
      }
    ).setOrigin(0.5);

    this.add.text(
      W / 2,
      200,
      "Game screen is working!",
      {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

  }

}


const config = {

  type: Phaser.AUTO,

  parent: "game-container",

  width: W,

  height: H,

  backgroundColor: "#123b2a",

  scale: {

    mode: Phaser.Scale.FIT,

    autoCenter: Phaser.Scale.CENTER_BOTH

  },

  scene: [
    Menu,
    Game
  ]

};


new Phaser.Game(config);
