


  (function () {
    const gameArea = document.getElementById('game-area');
    const basket = document.getElementById('basket');
    const scoreboard = document.getElementById('scoreboard');
    const gameOverScreen = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');

    const gameWidth = gameArea.clientWidth;
    const gameHeight = gameArea.clientHeight;

    let basketWidth = basket.offsetWidth;
    let basketX = gameWidth / 2 - basketWidth / 2;
    const basketSpeed = 15;

    let score = 0;
    let isGameOver = false;

    let fallingObjects = [];
    let spawnInterval;
    let animationFrameId;

    // Basket movement control variables
    let moveLeft = false;
    let moveRight = false;

    // Utility: Clamp function
    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    // Update basket position
    function updateBasket() {
      if (moveLeft) {
        basketX -= basketSpeed;
      } else if (moveRight) {
        basketX += basketSpeed;
      }
      basketX = clamp(basketX, 0, gameWidth - basketWidth);
      basket.style.left = basketX + 'px';
    }

    
    // Define multiple colors for falling objects
    const colors = [
      'linear-gradient(135deg, #dc0d0d, #c70000)', // Red
      'linear-gradient(135deg,rgb(59, 61, 169),rgb(26, 110, 169))', // Blue
      'linear-gradient(135deg, #0ddc0d,rgb(12, 93, 12))', // Green
      'linear-gradient(135deg, #f9f871,rgb(122, 106, 27))', // Yellow
      'linear-gradient(135deg, #dc0ddc,rgb(120, 12, 120))'  // Purple
    ];

    // Spawn a new falling object
    function spawnObject() {
      if (isGameOver) return;
      const obj = document.createElement('div');
      obj.classList.add('falling-object');

      // 20% chance to spawn a star object for visual variety
    //   if (Math.random() < 0.2) {
    //     obj.classList.add('star');
    //   }



        // Randomly select a color from the colors array
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      obj.style.background = randomColor;


      // Random horizontal position
      const x = Math.random() * (gameWidth - 30);
      obj.style.left = x + 'px';

      // Random fall duration (speed)
      const duration = 4000 + Math.random() * 2000; // 4-6 seconds
      obj.style.animationDuration = duration + 'ms';

      obj.style.top = '-30px';

      gameArea.appendChild(obj);

      const fallingObj = {
        element: obj,
        x: x,
        y: -30,
        width: 30,
        height: 30,
        speed: gameHeight / (duration / 16.67), // approx px per frame
      };
      fallingObjects.push(fallingObj);
    }

    // Check collision between basket and object
    function isColliding(basketX, basketW, objX, objY, objW, objH) {
      const basketY = gameHeight - basket.offsetHeight - 20; // basket fixed y position

      return !(
        basketX > objX + objW ||
        basketX + basketW < objX ||
        basketY > objY + objH ||
        basketY + basket.offsetHeight < objY
      );
    }

    // Update falling objects position and check catches or misses
    function updateFallingObjects() {
      for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        obj.y += obj.speed;

        if (obj.y > gameHeight) {
          // Missed object: game over
          endGame();
          return;
        }

        obj.element.style.top = obj.y + 'px';

        // Check collision with basket
        if (isColliding(basketX, basketWidth, obj.x, obj.y, obj.width, obj.height)) {
          // Caught the object
          score++;
          scoreboard.textContent = `Score: ${score}`;

          // Remove object
          gameArea.removeChild(obj.element);
          fallingObjects.splice(i, 1);

          // Play catch animation
          catchAnimation();
        }
      }
    }

    // Visual feedback on catching
    function catchAnimation() {
      basket.style.background = 'linear-gradient(135deg, #51e1f4, #14b3d5)';
      setTimeout(() => {
        if (!isGameOver) {
          basket.style.background = 'linear-gradient(135deg, #ffd700, #ffbf00)';
        }
      }, 150);
    }

    // Game over routine
    function endGame() {
      isGameOver = true;
      gameOverScreen.style.display = 'block';
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
    }

    // Restart game
    function restartGame() {
      // Reset
      isGameOver = false;
      score = 0;
      scoreboard.textContent = `Score: ${score}`;
      basket.style.background = 'linear-gradient(135deg, #ffd700, #ffbf00)';
      gameOverScreen.style.display = 'none';

      // Remove existing objects
      fallingObjects.forEach(obj => {
        if (obj.element.parentNode === gameArea) {
          gameArea.removeChild(obj.element);
        }
      });
      fallingObjects = [];

      basketX = gameWidth / 2 - basketWidth / 2;
      basket.style.left = basketX + 'px';

      // Restart spawning and animation loop
      spawnInterval = setInterval(spawnObject, 1000);
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Main game loop
    function gameLoop() {
      if (isGameOver) return;
      updateBasket();
      updateFallingObjects();
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Keyboard input handlers
    function keyDownHandler(e) {
      if (isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight = true;
      }
    }
    function keyUpHandler(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight = false;
      }
    }

    // Mouse / touch controls for mobile
    function onPointerMove(e) {
      if (isGameOver) return;
      let clientX;
      if (e.touches) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }

      const rect = gameArea.getBoundingClientRect();
      let x = clientX - rect.left - basketWidth / 2;
      basketX = clamp(x, 0, gameWidth - basketWidth);
      basket.style.left = basketX + 'px';
    }

    // Initialize game
    function init() {
      basket.style.left = basketX + 'px';
      spawnInterval = setInterval(spawnObject, 1000);

      animationFrameId = requestAnimationFrame(gameLoop);

      window.addEventListener('keydown', keyDownHandler);
      window.addEventListener('keyup', keyUpHandler);
      gameArea.addEventListener('mousemove', onPointerMove);
      gameArea.addEventListener('touchmove', onPointerMove);

      restartBtn.addEventListener('click', restartGame);
    }

    init();
  })();

