import TileMap from "./TileMap.js";

let score = 0;

const tileSize = 32;
const velocity = 2;
const canvas = document.getElementById("MyCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");

const tileMap = new TileMap(tileSize);
let pacman = tileMap.getPacman(velocity);
let ghosts = tileMap.getGhosts(velocity);

let gameRestart = setInterval(gameLoop, 1000 / 75);

let gameOver = false;
let gameWin = false;
const gameOverSound = new Audio("../sounds/gameOver.wav");
const gameWinSound = new Audio("../sounds/gameWin.wav");

function gameLoop() {
  tileMap.draw(ctx);
  drawGameEnd();
  pacman.draw(ctx, pause(), ghosts);
  ghosts.forEach((ghost) => ghost.draw(ctx, pause(), pacman));
  score = pacman.score;
  scoreDisplay.textContent = `Score: ${score}`;
  checkGameOver();
  checkGameWin();
}

function checkGameWin() {
  if (!gameWin) {
    gameWin = tileMap.didWin();
    if (gameWin) {
      gameWinSound.play();
    }
  }
}

function checkGameOver() {
  if (!gameOver) {
    gameOver = isGameOver();
    if (gameOver) {
      gameOverSound.play();
    }
  }
}

function isGameOver() {
  return ghosts.some(
    (ghost) => !pacman.powerDotActive && ghost.collideWith(pacman)
  );
}

function pause() {
  return !pacman.madeFirstMove || gameOver || gameWin;
}

function drawGameEnd() {
  if (gameOver || gameWin) {
    let text = " You Win!";
    if (gameOver) {
      text = "Game Over";
    }
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        ctx.font = "24px Arial";
    }
  }
  const restartBtn = document.getElementById("restartBtn");
  restartBtn.addEventListener("click", restartGame);

  function restartGame() { 
    clearInterval(gameRestart);
    tileMap.restart();
    pacman = tileMap.getPacman(velocity);
    ghosts = tileMap.getGhosts(velocity);

    score = 0;
    gameOver = false;
    gameWin = false;

    gameRestart = setInterval(gameLoop, 1000/75);
  }

tileMap.setCanvasSize(canvas);
