import MovingDirection from "./MovingDirection.js";

export default class Pacman {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.score = 0;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;

    this.currentMovingDirection = null;
    this.requestMovingDirection = null;

    this.pacmanAnimationTimerDefault = 10;
    this.pacmanAnimationTimer = null;

    this.pacmanRotation = this.Rotation.right;

    this.wakaSound = new Audio('../sounds/waka.wav');
    this.powerDotSound = new Audio('../sounds/power_dot.wav');
    this.eatGhostSound = new Audio('../sounds/eat_ghost.wav');

    this.powerDotActive = false;
    this.powerDotAboutToExpire = false;
    this.timers = [];

    this.madeFirstMove = false;

    this.lives = 2;

    document.addEventListener("keydown", this.#keydown);

    this.#loadPacmanImages();
  }

  Rotation = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  };

  draw(ctx, pause, ghosts) {
    if (!pause) {
      this.#move();
      this.#animate();
    }
    this.#eatDot();
    this.#eatPowerDot();
    this.#eatGhost(ghosts);
    this.#checkGhostCollision(ghosts);

    const size = this.tileSize / 2;

    //Pac-man rotation
    ctx.save();
    ctx.translate(this.x + size, this.y + size);
    ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180);
    ctx.drawImage(
      this.pacmanImages[this.pacmanImageIndex],
      -size,
      -size,
      this.tileSize,
      this.tileSize
    );

    ctx.restore();

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("Lives: " + this.lives, 20, 20);

    // ctx.drawImage(
    //   this.pacmanImages[this.pacmanImageIndex],
    //   this.x,
    //   this.y,
    //   this.tileSize,
    //   this.tileSize
    // );
   }
  #loadPacmanImages() {
    const pacmanImage1 = new Image();
    pacmanImage1.src = "../images//pac0.png";

    const pacmanImage2 = new Image();
    pacmanImage2.src = "../images//pac1.png";

    const pacmanImage3 = new Image();
    pacmanImage3.src = "../images//pac2.png";


    this.pacmanImages = [
      pacmanImage1,
      pacmanImage2,
      pacmanImage3,
    ];

    this.pacmanImageIndex = 0;
  }

  #keydown = (event) => {
    //up
    if (event.keyCode == 38) {
      if (this.currentMovingDirection == MovingDirection.down)
        this.currentMovingDirection = MovingDirection.up;
      this.requestMovingDirection = MovingDirection.up;
      this.madeFirstMove= true;
    }
    //down
    if (event.keyCode == 40) {
      if (this.currentMovingDirection == MovingDirection.up)
        this.currentMovingDirection = MovingDirection.down;
      this.requestMovingDirection = MovingDirection.down;
      this.madeFirstMove= true;
    }
    //left
    if (event.keyCode == 37) {
      if (this.currentMovingDirection == MovingDirection.right)
        this.currentMovingDirection = MovingDirection.left;
      this.requestMovingDirection = MovingDirection.left;
      this.madeFirstMove= true;
    }
    //right
    if (event.keyCode == 39) {
      if (this.currentMovingDirection == MovingDirection.left)
        this.currentMovingDirection = MovingDirection.right;
      this.requestMovingDirection = MovingDirection.right;
      this.madeFirstMove= true;
    }
  };

  #move() {
    if (this.currentMovingDirection !== this.requestMovingDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize)
      ) {
        if (
          !this.tileMap.didCollideWithEnvironment(
            this.x,
            this.y,
            this.requestMovingDirection
          )
        )
          this.currentMovingDirection = this.requestMovingDirection;
      }
    }

    if (
      this.tileMap.didCollideWithEnvironment(
        this.x,
        this.y,
        this.currentMovingDirection
      )
    ) {
      this.pacmanAnimationTimer = null;
      this.pacmanImageIndex = 1;
      return;
    } else if (
      this.currentMovingDirection != null &&
      this.pacmanAnimationTimer == null
    ) {
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
    }
    switch (this.currentMovingDirection) {
      case MovingDirection.up:
        this.y -= this.velocity;
        this.pacmanRotation = this.Rotation.up;
        break;
      case MovingDirection.down:
        this.y += this.velocity;
        this.pacmanRotation = this.Rotation.down;
        break;
      case MovingDirection.right:
        this.x += this.velocity;
        this.pacmanRotation = this.Rotation.right;
        break;
      case MovingDirection.left:
        this.x -= this.velocity;
        this.pacmanRotation = this.Rotation.left;
        break;
    }
  }

  #animate() {
    if (this.pacmanAnimationTimer == null) {
      return;
    }
    this.pacmanAnimationTimer--;
    if (this.pacmanAnimationTimer == 0) {
      this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
      this.pacmanImageIndex++;
      if (this.pacmanImageIndex == this.pacmanImages.length)
        this.pacmanImageIndex = 0;
    }
  }

  #eatDot() {
    if(this.tileMap.eatDot(this.x, this.y) && this.madeFirstMove) {
      this.wakaSound.play();
      this.score += 10;
    }
  }

  #eatPowerDot() {
    if(this.tileMap.eatPowerDot(this.x, this.y)) {
      this.powerDotSound.play();
      this.powerDotActive = true;
      this.powerDotAboutToExpire = false;
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers = [];

      let powerDotTimer = setTimeout(() =>{
        this.powerDotActive= false;
        this.powerDotAboutToExpire = false;
      },1000*5)

      this.timers.push(powerDotTimer);

      let powerDotAboutToExpireTimer = setTimeout(()=>{
        this.powerDotAboutToExpire = true;
      }, 1000*3)

      this.timers.push(powerDotAboutToExpireTimer);
      this.score += 50;
    }
    
  }

  #eatGhost(ghosts) {
    if(this.powerDotActive){
      const collideGhosts = ghosts.filter((ghost) => ghost.collideWith(this));
      collideGhosts.forEach((ghost) => {ghosts.splice(ghosts.indexOf(ghost), 1);
        this.eatGhostSound.play();
        this.score += 100; 
      })
    }
  }

  #checkGhostCollision(ghosts) {
    ghosts.forEach((ghost) => {
      if (ghost.collideWith(this) && !this.powerDotActive) {
        this.lives--;
        if (this.lives > 0) {
          this.#resetPosition();
        } else {
          this.lives = 0;
        }
      }
    });
  }

  #resetPosition() {
    this.x = this.startX;
    this.y = this.startY;
    this.currentMovingDirection = null;
    this.requestMovingDirection = null;
  }
  
}
