class Transition {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.canvas = game.canvas;
    this.score = 0;
    this.speed = 2;
    this.gameOver = false;
    this.fruits = [];
    this.grenades = [];
    this.explosions = [];
    this.splashes = [];

    // Asset loading
    this.fruitImagesSrc = [
      "sprites/blueberry.png", "sprites/cherry.png", "sprites/grape.png",
      "sprites/green_apple.png", "sprites/orange.png", "sprites/pear.png",
      "sprites/pepper.png", "sprites/pumpkin.png", "sprites/red_apple.png",
      "sprites/strawberry.png", "sprites/tomato.png"
    ];
    this.grenadeImg = new Image();
    this.grenadeImg.src = 'sprites/grenade.png';
    this.explosionImg = new Image();
    this.explosionImg.src = 'sprites/explosion-sheet.png';
    this.splashImg = new Image();
    this.splashImg.src = 'sprites/splash.png';

    // Sounds (persistent sound effects)
    this.fruitSound = new Audio('audios/pop.mp3');
    this.grenadeSound = new Audio('audios/explosion.wav');
    this.missSound = new Audio('audios/fruit_lost.mp3');
  }

  spawnFruits() {
    if (Math.random() < 0.02) {
      const fruitImg = new Image();
      fruitImg.src = this.fruitImagesSrc[Math.floor(Math.random() * this.fruitImagesSrc.length)];
      this.fruits.push({ x: Math.random() * this.canvas.width, y: 0, img: fruitImg });
    }
  }

  spawnGrenades() {
    if (Math.random() < 0.01) {
      this.grenades.push({ x: Math.random() * this.canvas.width, y: 0 });
    }
  }

  updateExplosions() {
    const frameSize = 44;
    const totalFrames = 3;
    this.explosions.forEach((explosion, index) => {
      this.ctx.drawImage(
        this.explosionImg,
        explosion.frame * frameSize,
        0,
        frameSize,
        48,
        explosion.x,
        explosion.y,
        44,
        48
      );
      explosion.frameTimer++;
      if (explosion.frameTimer >= explosion.frameDelay) {
        explosion.frame++;
        explosion.frameTimer = 0;
      }
      if (explosion.frame >= totalFrames) {
        this.explosions.splice(index, 1);
      }
    });
  }

  updateSplashes() {
    this.splashes.forEach((splash, index) => {
      this.ctx.drawImage(this.splashImg, splash.x, splash.y, 50, 50);
      splash.frame++;
      if (splash.frame > 10) {
        this.splashes.splice(index, 1);
      }
    });
  }

  updateSpeed() {
    this.speed += 0.001;
  }

  resetCommon() {
    this.score = 0;
    this.speed = 2;
    this.gameOver = false;
    this.fruits = [];
    this.grenades = [];
    this.explosions = [];
    this.splashes = [];
  }
}

