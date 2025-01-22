class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.basket = { x: this.canvas.width / 2, y: this.canvas.height - 100, width: 100, height: 50 };
      this.fruits = [];
      this.grenades = [];
      this.score = 0;
      this.speed = 2;
      this.gameOver = false;
      this.fruitSound = new Audio('fruit.mp3');
      this.grenadeSound = new Audio('grenade.mp3');
      this.missSound = new Audio('miss.mp3');
      this.basketImg = new Image();
      this.basketImg.src = 'basket.png';
      this.fruitImg = new Image();
      this.fruitImg.src = 'fruit.png';
      this.grenadeImg = new Image();
      this.grenadeImg.src = 'grenade.png';
  
      this.setupEvents();
      this.gameLoop();
    }
  
    setupEvents() {
      document.addEventListener('mousemove', (e) => {
        this.basket.x = e.clientX - this.basket.width / 2;
      });
    }
  
    gameLoop() {
      if (this.gameOver) {
        this.ctx.fillStyle = 'red';
        this.ctx.font = '50px Arial';
        this.ctx.fillText('Game Over!', this.canvas.width / 2 - 150, this.canvas.height / 2);
        this.ctx.font = '30px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2 - 80, this.canvas.height / 2 + 50);
        return;
      }
  
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      this.drawBasket();
      this.updateFruits();
      this.updateGrenades();
      this.updateSpeed();
      this.updateScore();
  
      requestAnimationFrame(() => this.gameLoop());
    }
  
    drawBasket() {
      this.ctx.drawImage(this.basketImg, this.basket.x, this.basket.y, this.basket.width, this.basket.height);
    }
  
    updateFruits() {
      if (Math.random() < 0.02) {
        this.fruits.push({ x: Math.random() * this.canvas.width, y: 0 });
      }
      this.fruits.forEach((fruit, index) => {
        fruit.y += this.speed;
        this.ctx.drawImage(this.fruitImg, fruit.x, fruit.y, 40, 40);
  
        if (fruit.y + 40 > this.basket.y && fruit.x + 40 > this.basket.x && fruit.x < this.basket.x + this.basket.width) {
          this.fruits.splice(index, 1);
          this.score++;
          this.fruitSound.play();
        }
  
        if (fruit.y > this.canvas.height) {
          this.fruits.splice(index, 1);
          this.missSound.play();
        }
      });
    }
  
    updateGrenades() {
      if (Math.random() < 0.01) {
        this.grenades.push({ x: Math.random() * this.canvas.width, y: 0 });
      }
      this.grenades.forEach((grenade, index) => {
        grenade.y += this.speed;
        this.ctx.drawImage(this.grenadeImg, grenade.x, grenade.y, 40, 40);
  
        if (grenade.y + 40 > this.basket.y && grenade.x + 40 > this.basket.x && grenade.x < this.basket.x + this.basket.width) {
          this.grenadeSound.play();
          this.gameOver = true;
        }
  
        if (grenade.y > this.canvas.height) {
          this.grenades.splice(index, 1);
        }
      });
    }
  
    updateSpeed() {
      this.speed += 0.001;
    }
  
    updateScore() {
      this.ctx.fillStyle = 'black';
      this.ctx.font = '30px Arial';
      this.ctx.fillText(`Score: ${this.score}`, 20, 40);
    }
  }
  
  new Game();

  


  