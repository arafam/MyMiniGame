class Level2 extends Transition {
  constructor(game) {
    super(game);
    // Load sprite sheets and images
    this.playerImg = new Image();
    this.playerImg.src = 'sprites/Player.png';
    this.arrowImg = new Image();
    this.arrowImg.src = 'sprites/arrow.png';
    this.powerUpImg = new Image();
    this.powerUpImg.src = 'sprites/powerup.png';

    // Setup player properties
    this.player = { 
      x: this.canvas.width / 2, 
      y: this.canvas.height - 120, 
      width: 80, 
      height: 80 
    };

    // Fixed animation settings
    this.playerAnimation = {
      frame: 2,
      spriteWidth: 129,
      spriteHeight: 100
    };

    // Level2-specific entities
    this.arrows = [];
    this.powerUps = [];
    this.missCount = 0;
    this.grenadeHitCount = 0;
    this.slowEffectActive = false;
    this.slowEffectTimer = 0;
  }

  shootArrow() {
    let arrow = {
      x: this.player.x + this.player.width / 2 - 16,
      y: this.player.y,
      width: 32,
      height: 32,
    };
    this.arrows.push(arrow);
    let shootSound = new Audio('audios/shoot.mp3');
    shootSound.volume = this.game.getSoundEffectsVolume();
    shootSound.play();
  }

  spawnPowerUps() {
    if (Math.random() < 0.005) {
      this.powerUps.push({ x: Math.random() * this.canvas.width, y: 0, type: 'slow' });
    }
  }

  update() {
    if (this.gameOver || this.missCount >= 10) {
      this.gameOver = true;
      return;
    }

    this.spawnFruits();
    this.spawnGrenades();
    this.spawnPowerUps();

    this.fruits.forEach((fruit, index) => {
      fruit.y += this.speed;
      this.arrows.forEach((arrow, aIndex) => {
        if (
          arrow.x < fruit.x + 40 &&
          arrow.x + arrow.width > fruit.x &&
          arrow.y < fruit.y + 40 &&
          arrow.y + arrow.height > fruit.y
        ) {
          this.fruits.splice(index, 1);
          this.arrows.splice(aIndex, 1);
          this.score++;
          this.fruitSound.volume = this.game.getSoundEffectsVolume();
          this.fruitSound.play();
        }
      });
      if (fruit.y > this.canvas.height) {
        this.fruits.splice(index, 1);
        this.missCount++;
        this.splashes.push({ x: fruit.x, y: this.canvas.height - 40, frame: 0 });
        this.missSound.volume = this.game.getSoundEffectsVolume();
        this.missSound.play();
      }
    });

    this.arrows.forEach((arrow, index) => {
      arrow.y -= 10;
      if (arrow.y < 0) {
        this.arrows.splice(index, 1);
      }
    });

    this.grenades.forEach((grenade, gIndex) => {
      grenade.y += this.speed;
      if (
        grenade.y + 40 > this.player.y &&
        grenade.x + 40 > this.player.x &&
        grenade.x < this.player.x + this.player.width
      ) {
        this.grenadeSound.volume = this.game.getSoundEffectsVolume();
        this.grenadeSound.play();
        this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0, frameTimer: 0, frameDelay: 10 });
        this.gameOver = true;
      }
      this.arrows.forEach((arrow, aIndex) => {
        if (
          arrow.x < grenade.x + 40 &&
          arrow.x + arrow.width > grenade.x &&
          arrow.y < grenade.y + 40 &&
          arrow.y + arrow.height > grenade.y
        ) {
          this.grenadeHitCount++;
          this.grenadeSound.volume = this.game.getSoundEffectsVolume();
          this.grenadeSound.play();
          this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0, frameTimer: 0, frameDelay: 10 });
          if (this.grenadeHitCount >= 10) {
            this.gameOver = true;
          }
          this.grenades.splice(gIndex, 1);
          this.arrows.splice(aIndex, 1);
        }
      });
      if (grenade.y > this.canvas.height) {
        this.grenades.splice(gIndex, 1);
      }
    });

    this.powerUps.forEach((powerUp, index) => {
      powerUp.y += this.speed;
      if (
        powerUp.x < this.player.x + this.player.width &&
        powerUp.x + 40 > this.player.x &&
        powerUp.y < this.player.y + this.player.height &&
        powerUp.y + 40 > this.player.y
      ) {
        this.slowEffectActive = true;
        this.slowEffectTimer = 300;
        let powerupSound = new Audio('audios/powerup.wav');
        powerupSound.volume = this.game.getSoundEffectsVolume();
        powerupSound.play();
        this.powerUps.splice(index, 1);
      }
      if (powerUp.y > this.canvas.height) {
        this.powerUps.splice(index, 1);
      }
    });

    if (this.slowEffectActive) {
      this.speed = Math.max(1, this.speed - 0.05);
      this.slowEffectTimer--;
      if (this.slowEffectTimer <= 0) {
        this.slowEffectActive = false;
      }
    } else {
      this.speed += 0.001;
    }

    this.updateExplosions();
    this.updateSplashes();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.playerImg,
      this.playerAnimation.frame * this.playerAnimation.spriteWidth + 2,
      2,
      this.playerAnimation.spriteWidth - 4,
      this.playerAnimation.spriteHeight - 4,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    this.fruits.forEach((fruit) => {
      this.ctx.drawImage(fruit.img, fruit.x, fruit.y, 40, 40);
    });

    this.grenades.forEach((grenade) => {
      this.ctx.drawImage(this.grenadeImg, grenade.x, grenade.y, 40, 40);
    });

    this.arrows.forEach((arrow) => {
      this.ctx.drawImage(
        this.arrowImg,
        0,
        0,
        32,
        32,
        arrow.x,
        arrow.y,
        32,
        32
      );
    });

    this.powerUps.forEach((powerUp) => {
      this.ctx.drawImage(this.powerUpImg, powerUp.x, powerUp.y, 40, 40);
    });

    this.updateExplosions();
    this.updateSplashes();
    this.ctx.fillStyle = 'black';
    this.ctx.font = '30px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 40);
    this.ctx.fillText(`Missed: ${this.missCount}/10`, 10, 80);
    this.ctx.fillText(`Grenades Hit: ${this.grenadeHitCount}/10`, 10, 120);

    if (this.gameOver || this.missCount >= 10) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '50px Arial';
      this.ctx.fillText('Game Over!', this.canvas.width / 2 - 150, this.canvas.height / 2);
      this.ctx.font = '30px Arial';
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2 - 80, this.canvas.height / 2 + 50);
      this.game.showRestartButton();
    }
  }

  reset() {
    this.resetCommon();
    this.arrows = [];
    this.powerUps = [];
    this.missCount = 0;
    this.grenadeHitCount = 0;
    this.slowEffectActive = false;
  }
}



