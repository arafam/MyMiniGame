// Level1: Basket Collecting Fruits 
class Level1 extends Level {
    constructor(game) {
      super(game);
      // Level 1 specific assets
      this.basketImg = new Image();
      this.basketImg.src = 'sprites/basket.png';
      // Basket object
      this.basket = { x: this.canvas.width / 2, y: this.canvas.height - 100, width: 100, height: 50 };
  
      // Control basket with mouse
      document.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.basket.x = e.clientX - rect.left - this.basket.width / 2;
      });
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
          this.fruitSound.play();
        }
        // Missed fruit
        if (fruit.y > this.canvas.height) {
          this.fruits.splice(index, 1);
          this.splashes.push({ x: fruit.x, y: this.canvas.height - 40, frame: 0 });
          this.missSound.play();
        }
      });
  
      // Update grenades
      this.grenades.forEach((grenade, index) => {
        grenade.y += this.speed;
        // Collision with basket
        if (
          grenade.y + 40 > this.basket.y &&
          grenade.x + 40 > this.basket.x &&
          grenade.x < this.basket.x + this.basket.width
        ) {
          this.grenadeSound.play();
          this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0 });
          this.gameOver = true;
        }
        if (grenade.y > this.canvas.height) {
          this.grenades.splice(index, 1);
        }
      });
  
      this.updateExplosions();
      this.updateSplashes();
      this.updateSpeed();
  
      // If target score reached, show "Next Level" button.
      if (this.score >= 20) {
      //if (this.score >= this.game.highScore) {
        this.game.showNextLevelButton();
      }
      // I will use that on final
      // if (this.score >= 10 && this.score >= this.game.highScore) {
      //   this.game.showNextLevelButton();
      // }
      
    }
  
    render() {
      // Clear the canvas
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
      // Draw explosions and splashes
      this.updateExplosions();
      this.updateSplashes();
      // Draw score
      this.ctx.fillStyle = 'black';
      this.ctx.font = '30px Arial';
      this.ctx.fillText(`Score: ${this.score}`, 20, 40);
  
      // Game Over screen
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



