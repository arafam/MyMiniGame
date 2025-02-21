// Level2: Player Collecting Fruits by shooting at them. 
class Level2 extends Level {
  constructor(game) {
    super(game);
    // Load sprite sheets
    this.playerImg = new Image();
    this.playerImg.src = 'sprites/Player.png'; // Player sprite sheet (8 frames, each 129x100)
    this.arrowImg = new Image();
    this.arrowImg.src = 'sprites/arrow.png'; // Arrow sprite sheet (frames at x: 0,40,80,... but we'll use the first frame)
    this.powerUpImg = new Image();
    this.powerUpImg.src = 'sprites/powerup.png'; // Power-up image

    // Setup player properties
    this.player = { 
      x: this.canvas.width / 2, 
      y: this.canvas.height - 120, 
      width: 80, 
      height: 80 
    };

    // Setup player animation properties
    // this.playerAnimation = {
    //   frame: 0,
    //   elapsed: 0,
    //   frameDuration: 12, // wait ~12 frames before switching (adjust as needed)
    //   frameCount: 8,     // 8 frames in the player sprite sheet
    //   spriteWidth: 129,
    //   spriteHeight: 100
    // };
    // Fixed animation settings: Use only the third frame for player (frame index 2) 
    // and the first frame for arrows.
    this.playerAnimation = {
      frame: 2, // always use the third frame
      spriteWidth: 129,
      spriteHeight: 100
    };

    // Arrow animation settings (for all arrows)
    // this.arrowAnimation = {
    //   frameDuration: 12, // wait ~12 frames between frames
    //   frameCount: 5      // 5 frames in the arrow sprite sheet
    // };

    // Level2-specific entities
    this.arrows = [];
    this.powerUps = [];
    this.missCount = 0;
    this.grenadeHitCount = 0; // Tracks how many grenades were hit
    this.slowEffectActive = false;
    this.slowEffectTimer = 0;
  }

  shootArrow() {
    // Create an arrow with its own animation properties
    let arrow = {
      x: this.player.x + this.player.width / 2 - 16, // center arrow (drawn width = 32)
      y: this.player.y,
      width: 32,
      height: 32,
      //frame: 0,
      //elapsed: 0
    };
    this.arrows.push(arrow);
    new Audio('audios/shoot.mp3').play();
  }

  spawnPowerUps() {
    if (Math.random() < 0.005) {
      // Only one type: slow effect power-up
      this.powerUps.push({ x: Math.random() * this.canvas.width, y: 0, type: 'slow' });
    }
  }

  update() {
    if (this.gameOver || this.missCount >= 10) {
      this.gameOver = true;
      return;
    }

    // Spawn falling objects
    this.spawnFruits();
    this.spawnGrenades();
    this.spawnPowerUps();

    // --- Update Player Animation ---
    // this.playerAnimation.elapsed++;
    // if (this.playerAnimation.elapsed >= this.playerAnimation.frameDuration) {
    //   this.playerAnimation.frame = (this.playerAnimation.frame + 1) % this.playerAnimation.frameCount;
    //   this.playerAnimation.elapsed = 0;
    // }

    // --- Update Fruits ---
    this.fruits.forEach((fruit, index) => {
      fruit.y += this.speed;
      // Check collision with arrows
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
          this.fruitSound.play();
        }
      });
      // Fruit missed: increase miss count
      if (fruit.y > this.canvas.height) {
        this.fruits.splice(index, 1);
        this.missCount++;
        this.splashes.push({ x: fruit.x, y: this.canvas.height - 40, frame: 0 });
        this.missSound.play();
      }
    });

    // --- Update Arrows ---
    this.arrows.forEach((arrow, index) => {
      arrow.y -= 10;
      // arrow.elapsed++;
      // if (arrow.elapsed >= this.arrowAnimation.frameDuration) {
      //   arrow.frame = (arrow.frame + 1) % this.arrowAnimation.frameCount;
      //   arrow.elapsed = 0;
      // }
      if (arrow.y < 0) {
        this.arrows.splice(index, 1);
      }
    });

    // --- Update Grenades ---
    this.grenades.forEach((grenade, gIndex) => {
      grenade.y += this.speed;
      // Check collision with the player
      if (
        grenade.y + 40 > this.player.y &&
        grenade.x + 40 > this.player.x &&
        grenade.x < this.player.x + this.player.width
      ) {
        this.grenadeSound.play();
        //this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0, frameTimer: 0, frameDelay: 10 });
        this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0});
        this.gameOver = true;
      }
      // Check collision with each arrow
      this.arrows.forEach((arrow, aIndex) => {
        if (
          arrow.x < grenade.x + 40 &&
          arrow.x + arrow.width > grenade.x &&
          arrow.y < grenade.y + 40 &&
          arrow.y + arrow.height > grenade.y
        ) {
          // Increase grenade hit count
          this.grenadeHitCount++;

          // Play explosion effect
          this.grenadeSound.play();     
          this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0, frameTimer: 0, frameDelay: 10 });
          //this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0 });

          // If the player has hit 10 grenades, end the game
          if (this.grenadeHitCount >= 10) {
            this.gameOver = true;
          }
          //this.gameOver = true;      // 1 hit, game over 

          // Remove the grenade and the arrow
          this.grenades.splice(gIndex, 1);
          this.arrows.splice(aIndex, 1);
        }
      });
      if (grenade.y > this.canvas.height) {
        this.grenades.splice(gIndex, 1);
      }
    });

    // --- Update Power-ups ---
    this.powerUps.forEach((powerUp, index) => {
      powerUp.y += this.speed;
      if (
        powerUp.x < this.player.x + this.player.width &&
        powerUp.x + 40 > this.player.x &&
        powerUp.y < this.player.y + this.player.height &&
        powerUp.y + 40 > this.player.y
      ) {
        this.slowEffectActive = true;
        this.slowEffectTimer = 300; // lasts ~300 frames (~5 seconds)
        new Audio('audios/powerup.wav').play();
        this.powerUps.splice(index, 1);
      }
      if (powerUp.y > this.canvas.height) {
        this.powerUps.splice(index, 1);
      }
    });

    // --- Handle Slow Effect ---
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

    // --- Draw Animated Player ---
    this.ctx.drawImage(
      this.playerImg,
      this.playerAnimation.frame * this.playerAnimation.spriteWidth + 2, // shift right by 2 pixel
      2, // shift down by 2 pixel
      this.playerAnimation.spriteWidth - 4, // remove pixel from left and right
      this.playerAnimation.spriteHeight - 4, // remove pixel from top and bottom
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );    

    // --- Draw Fruits ---
    this.fruits.forEach((fruit) => {
      this.ctx.drawImage(fruit.img, fruit.x, fruit.y, 40, 40);
    });

    // --- Draw Grenades ---
    this.grenades.forEach((grenade) => {
      this.ctx.drawImage(this.grenadeImg, grenade.x, grenade.y, 40, 40);
    });

    // --- Draw Animated Arrows ---
    this.arrows.forEach((arrow) => {
      // Source x: each arrow frame is 32px wide with 8px spacing (40px total per frame)
      this.ctx.drawImage(
        this.arrowImg,
        //arrow.frame * 40, // source x from arrow sprite sheet
        0,                // always use the first frame
        0,                // source y
        32,               // source width
        32,               // source height
        arrow.x,
        arrow.y,
        32,
        32
      );
    });

    // --- Draw Power-ups ---
    this.powerUps.forEach((powerUp) => {
      this.ctx.drawImage(this.powerUpImg, powerUp.x, powerUp.y, 40, 40);
    });

    // --- Draw Explosions, Splashes, Score, and Miss Count ---
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
    this.missCount = 0;    // Reset missed fruit count
    this.grenadeHitCount = 0; // Reset grenade hit count
    this.slowEffectActive = false;
  }

}






