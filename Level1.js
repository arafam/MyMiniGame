class Level1 extends Transition {
  constructor(game) {
    super(game);
    // Level 1 specific asset: basket image
    this.basketImg = new Image();
    this.basketImg.src = 'sprites/basket.png';
    // Basket object
    this.basket = { x: this.canvas.width / 2, y: this.canvas.height - 100, width: 100, height: 50 };
  }

  update() {
    if (this.gameOver) return;
    this.spawnFruits();
    this.spawnGrenades();

    // Update fruits
    this.fruits.forEach((fruit, index) => {
      fruit.y += this.speed;
      // Collision with basket
      if (
        fruit.y + 40 > this.basket.y &&
        fruit.x + 40 > this.basket.x &&
        fruit.x < this.basket.x + this.basket.width
      ) {
        this.fruits.splice(index, 1);
        this.score++;
        this.fruitSound.volume = this.game.getSoundEffectsVolume();
        this.fruitSound.play();
      }
      // Fruit missed: remove fruit, play sound, and decrement score
      if (fruit.y > this.canvas.height) {
        this.fruits.splice(index, 1);
        this.splashes.push({ x: fruit.x, y: this.canvas.height - 40, frame: 0 });
        this.missSound.volume = this.game.getSoundEffectsVolume();
        this.missSound.play();
        this.score = Math.max(0, this.score - 1);
      }
    });

    // Update grenades
    this.grenades.forEach((grenade, index) => {
      grenade.y += this.speed;
      if (
        grenade.y + 40 > this.basket.y &&
        grenade.x + 40 > this.basket.x &&
        grenade.x < this.basket.x + this.basket.width
      ) {
        this.grenadeSound.volume = this.game.getSoundEffectsVolume();
        this.grenadeSound.play();
        this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0, frameTimer: 0, frameDelay: 10 });
        this.gameOver = true;
      }
      if (grenade.y > this.canvas.height) {
        this.grenades.splice(index, 1);
      }
    });

    this.updateExplosions();
    this.updateSplashes();
    this.updateSpeed();

    if (this.score >= 20) {
      this.game.showNextLevelButton();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw basket
    this.ctx.drawImage(this.basketImg, this.basket.x, this.basket.y, this.basket.width, this.basket.height);
    // Draw fruits
    this.fruits.forEach((fruit) => {
      this.ctx.drawImage(fruit.img, fruit.x, fruit.y, 40, 40);
    });
    // Draw grenades
    this.grenades.forEach((grenade) => {
      this.ctx.drawImage(this.grenadeImg, grenade.x, grenade.y, 40, 40);
    });
    this.updateExplosions();
    this.updateSplashes();
    this.ctx.fillStyle = 'black';
    this.ctx.font = '30px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);

    if (this.gameOver) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '70px Arial';
      this.ctx.fillText('Game Over!', this.canvas.width / 2 - 150, this.canvas.height / 2);
      this.ctx.font = '40px Arial';
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2 - 80, this.canvas.height / 2 + 50);
      this.game.showRestartButton();
    }
  }

  reset() {
    this.resetCommon();
    this.basket.x = this.canvas.width / 2;
  }
}


