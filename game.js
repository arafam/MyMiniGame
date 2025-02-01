class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    //this.canvas.width = window.innerWidth / 2;
    //this.canvas.height = window.innerHeight / 2;
    this.canvas.width = window.innerWidth * 0.75;  //makes game window 60% of screen
    this.canvas.height = window.innerHeight * 0.75;
    this.canvas.style.position = 'absolute';
    //this.canvas.width = window.innerWidth;   // makes game screen same size as window
    //this.canvas.height = window.innerHeight; // makes game screen same size as window
    this.canvas.style.top = '40%';  // moves game screen up/down
    this.canvas.style.left = '50%'; // move game screeb left/right
    this.canvas.style.transform = 'translate(-50%, -50%)';
    // image background
    this.canvas.style.background = 'url("sprites/background.jpg") no-repeat center center';
    this.canvas.style.backgroundSize = 'cover';

    this.basket = { x: this.canvas.width / 2, y: this.canvas.height - 100, width: 100, height: 50 };
    this.fruits = [];
    this.grenades = [];
    this.explosions = [];
    this.splashes = [];
    this.score = 0;
    this.speed = 2;
    this.gameOver = false;

    this.fruitImages = [
      "sprites/blueberry.png", "sprites/cherry.png", "sprites/grape.png",
      "sprites/green_apple.png", "sprites/orange.png", "sprites/pear.png",
      "sprites/pepper.png", "sprites/pumpkin.png", "sprites/red_apple.png",
      "sprites/strawberry.png", "sprites/tomato.png", "sprites/grenade.png"
    ];

    this.fruitSound = new Audio('audios/pop.mp3');
    this.grenadeSound = new Audio('audios/fruit_lost.mp3');
    this.missSound = new Audio('audios/fruit_lost.mp3');
    //this.backgroundMusic = new Audio('audios/ShanghaiActionLoop.mp3');
    this.backgroundMusic = new Audio('audios/ShanghaiActionEnd.mp3');

    this.basketImg = new Image();
    this.basketImg.src = 'sprites/basket.png';

    this.grenadeImg = new Image();
    this.grenadeImg.src = 'sprites/grenade.png';

    this.explosionImg = new Image();
    this.explosionImg.src = 'sprites/explosion-sheet.png';

    this.splashImg = new Image();
    this.splashImg.src = 'sprites/splash.png';

    this.setupEvents();
    this.createRestartButton();
    this.startBackgroundMusic();
    this.gameLoop();
  }

  setupEvents() {
    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.basket.x = e.clientX - rect.left - this.basket.width / 2;
    });
  }

  createRestartButton() {
    const button = document.createElement('button');
    button.innerText = 'New Game';
    button.style.position = 'absolute';
    button.style.top = '50%';   // moves "new game" up/down
    button.style.left = '49%';  // moves "new game" left/right
    button.style.transform = 'translate(-50%, -50%)';
    button.style.padding = '10px 20px';
    button.style.fontSize = '20px';
    button.style.display = 'none';
    button.id = 'restartButton';
    document.body.appendChild(button);

    button.addEventListener('click', () => {
      this.resetGame();
      button.style.display = 'none';
    });
  }

  showRestartButton() {
    const button = document.getElementById('restartButton');
    button.style.display = 'block';
  }

  resetGame() {
    this.fruits = [];
    this.grenades = [];
    this.score = 0;
    this.speed = 2;
    this.gameOver = false;
    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic.play();
    this.gameLoop();
  }

  startBackgroundMusic() {
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5;
    this.backgroundMusic.play();
  }

  gameLoop() {
    if (this.gameOver) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '50px Arial';
      this.ctx.fillText('Game Over!', this.canvas.width / 2 - 150, this.canvas.height / 2);
      this.ctx.font = '30px Arial';
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2 - 80, this.canvas.height / 2 + 50);
      this.showRestartButton();
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBasket();
    this.updateFruits();
    this.updateGrenades();
    this.updateExplosions();
    this.updateSplashes();
    this.updateSpeed();
    this.updateScore();

    requestAnimationFrame(() => this.gameLoop());
  }

  drawBasket() {
    this.ctx.drawImage(this.basketImg, this.basket.x, this.basket.y, this.basket.width, this.basket.height);
  }

  updateFruits() {
    if (Math.random() < 0.02) {
      const fruitImage = new Image();
      fruitImage.src = this.fruitImages[Math.floor(Math.random() * this.fruitImages.length)];
      this.fruits.push({ x: Math.random() * this.canvas.width, y: 0, img: fruitImage });
    }
    this.fruits.forEach((fruit, index) => {
      fruit.y += this.speed;
      this.ctx.drawImage(fruit.img, fruit.x, fruit.y, 40, 40);

      if (fruit.y + 40 > this.basket.y && fruit.x + 40 > this.basket.x && fruit.x < this.basket.x + this.basket.width) {
        this.fruits.splice(index, 1);
        this.score++;
        this.fruitSound.play();
      }

      if (fruit.y > this.canvas.height) {
        this.fruits.splice(index, 1);
        this.splashes.push({ x: fruit.x, y: this.canvas.height - 40, frame: 0 });
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
        this.explosions.push({ x: grenade.x, y: grenade.y, frame: 0 });
        this.gameOver = true;
      }
      
      if (grenade.y > this.canvas.height) {
        this.grenades.splice(index, 1);
      }
    });
  }

  updateExplosions() {
    this.explosions.forEach((explosion, index) => {
      const frameSize = 44;
      const totalFrames = 3;
      this.ctx.drawImage(this.explosionImg, explosion.frame * frameSize, 0, frameSize, 48, explosion.x, explosion.y, 44, 48);
      explosion.frame++;
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

  updateScore() {
    this.ctx.fillStyle = 'black';
    this.ctx.font = '30px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);
  }
}

new Game();




