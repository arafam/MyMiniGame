// ==== Game Class: Main Orchestrator ====
class Game {
  constructor() {
    // Canvas setup
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth * 0.75;
    this.canvas.height = window.innerHeight * 0.75;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '40%';
    this.canvas.style.left = '50%';
    this.canvas.style.transform = 'translate(-50%, -50%)';
    this.canvas.style.background = 'url("sprites/background.jpg") no-repeat center center';
    this.canvas.style.backgroundSize = 'cover';

    // High score using localStorage
    this.highScore = parseInt(localStorage.getItem('highScore')) || 0;

    // Instantiate levels
    this.level1 = new Level1(this);
    this.level2 = new Level2(this);
    this.currentLevel = this.level1; // Start with Level 1

    // Setup UI buttons and background music
    this.setupUI();
    this.startBackgroundMusic();

    // Centralized mouse movement event for both levels:
    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      // Update player position if Level2; basket if Level1
      if (this.currentLevel instanceof Level1) {
        this.level1.basket.x = e.clientX - rect.left - this.level1.basket.width / 2;
      } else if (this.currentLevel instanceof Level2) {
        this.level2.player.x = e.clientX - rect.left - this.level2.player.width / 2;
      }
    });
    // Centralized click/space event for shooting arrows in Level2:
    document.addEventListener('click', () => {
      if (this.currentLevel instanceof Level2 && !this.currentLevel.gameOver) {
        this.currentLevel.shootArrow();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (this.currentLevel instanceof Level2 && e.code === 'Space' && !this.currentLevel.gameOver) {
        this.currentLevel.shootArrow();
      }
    });

    // Begin game loop
    this.gameLoop();
  }

  setupUI() {
    // Restart button for Game Over
    this.restartButton = document.createElement('button');
    this.restartButton.innerText = 'New Game';
    this.restartButton.style.position = 'absolute';
    this.restartButton.style.top = '75%'; // from 50
    this.restartButton.style.left = '17.5%'; // from 49 
    this.restartButton.style.transform = 'translate(-50%, -50%)';
    this.restartButton.style.padding = '10px 20px';
    this.restartButton.style.fontSize = '20px';
    this.restartButton.style.display = 'none';
    document.body.appendChild(this.restartButton);
    this.restartButton.addEventListener('click', () => {
      this.resetGame();
      this.restartButton.style.display = 'none';
    });

    // Next Level button (from Level 1 to Level 2)
    this.nextLevelButton = document.createElement('button');
    this.nextLevelButton.innerText = 'Next Level';
    this.nextLevelButton.style.position = 'absolute';
    this.nextLevelButton.style.top = '75%'; // move "Next Level" up/down
    this.nextLevelButton.style.left = '82.6%';
    this.nextLevelButton.style.transform = 'translate(-50%, -50%)';
    this.nextLevelButton.style.padding = '10px 20px';
    this.nextLevelButton.style.fontSize = '20px';
    this.nextLevelButton.style.display = 'none';
    document.body.appendChild(this.nextLevelButton);
    this.nextLevelButton.addEventListener('click', () => {
      this.changeLevel(2);
      this.nextLevelButton.style.display = 'none';
    });
  }

  startBackgroundMusic() {
    this.backgroundMusic = new Audio('audios/ShanghaiActionEnd.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5;
    this.backgroundMusic.play();
  }

  changeLevel(levelNumber) {
    if (levelNumber === 1) {
      this.currentLevel = this.level1;
    } else if (levelNumber === 2) {
      this.currentLevel = this.level2;
    }
  }

  updateLeaderboard() {
    if (this.currentLevel.score > this.highScore) {
      this.highScore = this.currentLevel.score;
      localStorage.setItem('highScore', this.highScore);
    }
    this.ctx.fillStyle = 'yellow';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width - 200, 40);
  }

  resetGame() {
    // Reset both levels
    this.level1.reset();
    this.level2.reset();
    // Restart from Level 1
    this.changeLevel(1);
  }

  showRestartButton() {
    this.restartButton.style.display = 'block';
  }

  showNextLevelButton() {
    this.nextLevelButton.style.display = 'block';
  }

  gameLoop() {
    // Delegate update and render to the current level
    this.currentLevel.update();
    this.currentLevel.render();
    this.updateLeaderboard();
    requestAnimationFrame(() => this.gameLoop());
  }

}









