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

    // Audio control state
    this.audioVolume = 0.5;          // Background music volume
    this.soundEffectsVolume = 0.5;   // Sound effects volume
    this.isMuted = false;

    // High score using localStorage
    this.highScore = parseInt(localStorage.getItem('highScore')) || 0;

    // Instantiate levels (Level1 and Level2 extend Transition now)
    this.level1 = new Level1(this);
    this.level2 = new Level2(this);
    this.currentLevel = this.level1; // Start with Level 1

    // Setup UI buttons, audio controls and background music
    this.setupUI();
    this.startBackgroundMusic();

    // Centralized mouse movement event for both levels:
    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
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
    this.restartButton.style.top = '75%';
    this.restartButton.style.left = '17.5%';
    this.restartButton.style.transform = 'translate(-50%, -50%)';
    this.restartButton.style.padding = '10px 20px';
    this.restartButton.style.fontSize = '20px';
    this.restartButton.style.display = 'none';
    document.body.appendChild(this.restartButton);
    this.restartButton.addEventListener('click', () => {
      this.resetGame();
      this.restartButton.style.display = 'none';
    });

    // Next Level button
    this.nextLevelButton = document.createElement('button');
    this.nextLevelButton.innerText = 'Next Level';
    this.nextLevelButton.style.position = 'absolute';
    this.nextLevelButton.style.top = '75%';
    this.nextLevelButton.style.left = '82.6%';
    this.nextLevelButton.style.transform = 'translate(-50%, -50%)';
    this.nextLevelButton.style.padding = '10px 20px';
    this.nextLevelButton.style.fontSize = '20px';
    this.nextLevelButton.style.display = 'none';
    document.body.appendChild(this.nextLevelButton);
    this.nextLevelButton.addEventListener('click', () => {
      this.transitionToLevel(2);
    });

    // About / How To Play button (placed at top-right)
    this.aboutButton = document.createElement('button');
    this.aboutButton.innerText = 'How to Play';
    this.aboutButton.style.position = 'absolute';
    this.aboutButton.style.top = '10px';
    this.aboutButton.style.right = '10px';
    this.aboutButton.style.padding = '5px 10px';
    document.body.appendChild(this.aboutButton);
    this.aboutButton.addEventListener('click', () => {
      document.getElementById('aboutScreen').style.display = 'block';
    });

    // Audio controls container at the bottom center
    this.audioControlsContainer = document.createElement('div');
    this.audioControlsContainer.style.position = 'absolute';
    this.audioControlsContainer.style.bottom = '100px';
    this.audioControlsContainer.style.left = '50%';
    this.audioControlsContainer.style.transform = 'translateX(-50%)';
    this.audioControlsContainer.style.display = 'flex';
    this.audioControlsContainer.style.alignItems = 'center';
    this.audioControlsContainer.style.gap = '10px';
    document.body.appendChild(this.audioControlsContainer);

    // Background Audio Label and Volume slider
    let bgLabel = document.createElement('span');
    bgLabel.innerText = 'Background Audio';
    bgLabel.style.color = 'white';
    this.audioControlsContainer.appendChild(bgLabel);

    // Background Music Volume slider
    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = 0;
    this.volumeSlider.max = 1;
    this.volumeSlider.step = 0.1;
    this.volumeSlider.value = this.audioVolume;
    this.audioControlsContainer.appendChild(this.volumeSlider);
    this.volumeSlider.addEventListener('input', (e) => {
      this.audioVolume = parseFloat(e.target.value);
      this.updateAudioVolume();
    });

    // Sound Effects Audio Label and Volume slider
    let sfxLabel = document.createElement('span');
    sfxLabel.innerText = 'Sound Effect Audio';
    sfxLabel.style.color = 'white';
    this.audioControlsContainer.appendChild(sfxLabel);

    // Sound Effects Volume slider
    this.sfxSlider = document.createElement('input');
    this.sfxSlider.type = 'range';
    this.sfxSlider.min = 0;
    this.sfxSlider.max = 1;
    this.sfxSlider.step = 0.1;
    this.sfxSlider.value = this.soundEffectsVolume;
    this.audioControlsContainer.appendChild(this.sfxSlider);
    this.sfxSlider.addEventListener('input', (e) => {
      this.soundEffectsVolume = parseFloat(e.target.value);
    });

    // Mute/Unmute button (affects both background and SFX)
    this.muteButton = document.createElement('button');
    this.muteButton.innerText = 'Mute';
    this.audioControlsContainer.appendChild(this.muteButton);
    this.muteButton.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.muteButton.innerText = this.isMuted ? 'Unmute' : 'Mute';
      this.updateAudioVolume();
    });

    // Track selector (dropdown list for background music)
    this.trackSelect = document.createElement('select');
    let tracks = [
      { name: 'Track 1', url: 'audios/ShanghaiActionEnd.mp3' },
      { name: 'Track 2', url: 'audios/game-music.mp3' },
      { name: 'Track 3', url: 'audios/8bit-music-game.mp3' }
    ];
    tracks.forEach(track => {
      let option = document.createElement('option');
      option.value = track.url;
      option.text = track.name;
      this.trackSelect.appendChild(option);
    });
    this.audioControlsContainer.appendChild(this.trackSelect);
    this.trackSelect.addEventListener('change', (e) => {
      this.backgroundMusic.pause();
      this.backgroundMusic = new Audio(e.target.value);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.getMusicVolume();
      const playMusic = () => {
        this.backgroundMusic.play().then(() => {
          document.removeEventListener('click', playMusic);
          document.removeEventListener('keydown', playMusic);
        }).catch(error => console.log('Audio play blocked:', error));
      };
      document.addEventListener('click', playMusic);
      document.addEventListener('keydown', playMusic);
    });
    
    // About Screen Close Button
    document.getElementById('closeAboutButton').addEventListener('click', () => {
      document.getElementById('aboutScreen').style.display = 'none';
    });
  }

  // Returns effective sound effect volume (0 if muted)
  getSoundEffectsVolume() {
    return this.isMuted ? 0 : this.soundEffectsVolume;
  }

  // Returns effective background music volume (0 if muted)
  getMusicVolume() {
    return this.isMuted ? 0 : this.audioVolume;
  }

  updateAudioVolume() {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.getMusicVolume();
    }
    // (Sound effects use getSoundEffectsVolume() on play)
  }

  startBackgroundMusic() {
    this.backgroundMusic = new Audio(this.trackSelect ? this.trackSelect.value : 'audios/ShanghaiActionEnd.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.getMusicVolume();
    const playMusic = () => {
      this.backgroundMusic.play().then(() => {
        document.removeEventListener('click', playMusic);
        document.removeEventListener('keydown', playMusic);
      }).catch(error => console.log('Audio play blocked:', error));
    };
    document.addEventListener('click', playMusic);
    document.addEventListener('keydown', playMusic);
  }

  transitionToLevel(levelNumber) {
    let alpha = 0;
    const fadeSpeed = 0.02;
    const fadeOut = () => {
      alpha += fadeSpeed;
      if (alpha >= 1) {
        alpha = 1;
        this.changeLevel(levelNumber);
        fadeIn();
        return;
      }
      this.drawOverlay(alpha);
      requestAnimationFrame(fadeOut);
    };
    const fadeIn = () => {
      alpha -= fadeSpeed;
      if (alpha <= 0) {
        alpha = 0;
        this.drawOverlay(alpha);
        return;
      }
      this.drawOverlay(alpha);
      requestAnimationFrame(fadeIn);
    };
    fadeOut();
  }

  drawOverlay(alpha) {
    this.ctx.save();
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
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
    this.level1.reset();
    this.level2.reset();
    this.changeLevel(1);
  }

  showRestartButton() {
    this.restartButton.style.display = 'block';
  }

  showNextLevelButton() {
    this.nextLevelButton.style.display = 'block';
  }

  gameLoop() {
    this.currentLevel.update();
    this.currentLevel.render();
    this.updateLeaderboard();
    requestAnimationFrame(() => this.gameLoop());
  }
}





