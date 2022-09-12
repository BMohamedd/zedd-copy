const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d"); // create a context
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 1;
const friction = 0.9;
const ballLimit = 200;
const spawnAttempts = 1;
const coloringLength = 250;
const mousePosition = {
  x: 9999999,
  y: 9999999,
};

document.addEventListener("mousemove", (e) => {
  mousePosition.x = e.x;
  mousePosition.y = e.y;
  return;
});

// utility functions

function random(min, max) {
  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  return Math.random() * (max - min) + min;
}
// find the distance between two points or two circles
function diff({ xv, yv, radius = 0 }, { xv1, yv1, radius1 = 0 }) {
  // check if the particle is an arc or a dot
  if (radius === 0) {
    // its a dot
    const xDiff = xv - xv1;
    const yDiff = yv - yv1;
    const distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    return distance;
  }
  // its an arc
  const xDiff = xv - xv1;
  const yDiff = yv - yv1;
  const distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  return distance - (radius1 + radius);
}
// collistion
function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotatedVelocities;
}
function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.Xvelocity - otherParticle.Xvelocity;
  const yVelocityDiff = particle.Yvelocity - otherParticle.Yvelocity;

  const xDist = otherParticle.xv - particle.xv;
  const yDist = otherParticle.yv - particle.yv;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.yv - particle.yv,
      otherParticle.xv - particle.xv
    );

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate({ x: particle.Xvelocity, y: particle.Yvelocity }, angle);
    const u2 = rotate(
      { x: otherParticle.Xvelocity, y: otherParticle.Yvelocity },
      angle
    );

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    return [
      { ...particle, ...{ Xvelocity: vFinal1.x, Yvelocity: vFinal1.y } },
      { ...otherParticle, ...{ Xvelocity: vFinal2.x, Yvelocity: vFinal2.y } },
    ];
  }
}
// hex2rgba
const hex2rgba = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

// random colors
var colors = [
  "#FF6633",
  "#FFB399",
  "#FF33FF",
  "#FFFF99",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
  "#80B300",
  "#809900",
  "#E6B3B3",
  "#6680B3",
  "#66991A",
  "#FF99E6",
  "#CCFF1A",
  "#FF1A66",
  "#E6331A",
  "#33FFCC",
  "#66994D",
  "#B366CC",
  "#4D8000",
  "#B33300",
  "#CC80CC",
  "#66664D",
  "#991AFF",
  "#E666FF",
  "#4DB3FF",
  "#1AB399",
  "#E666B3",
  "#33991A",
  "#CC9999",
  "#B3B31A",
  "#00E680",
  "#4D8066",
  "#809980",
  "#E6FF80",
  "#1AFF33",
  "#999933",
  "#FF3380",
  "#CCCC00",
  "#66E64D",
  "#4D80CC",
  "#9900B3",
  "#E64D66",
  "#4DB380",
  "#FF4D4D",
  "#99E6E6",
  "#6666FF",
];

var ballsArray = [];
class Ball {
  constructor({
    height = 10,
    width = 10,
    xv = innerWidth / 2,
    yv = innerHeight / 2,
    radius = 40,
    color = "black",
    Yvelocity = 1,
    Xvelocity = 1,
  }) {
    this.height = height;
    this.width = width;
    this.xv = xv;
    this.yv = yv;
    this.radius = radius;
    this.color = color;
    this.Yvelocity = Yvelocity;
    this.Xvelocity = Xvelocity;
    this.mass = 1;
    this.alpha = 0;
  }
  update(ballsArray) {
    // walls collition
    if (this.yv + this.radius > innerHeight || this.yv - this.radius < 0) {
      // if the ball hits the ground apply friction to its x and y vilocity
      this.Yvelocity = -this.Yvelocity;
    }
    if (
      this.xv + this.radius + this.Xvelocity > innerWidth ||
      this.xv - this.radius < 0
    ) {
      // if the ball hits one of the walls apply friction to it
      this.Xvelocity = -this.Xvelocity;
    }
    this.xv += this.Xvelocity;
    this.yv += this.Yvelocity;
    // balls collision
    for (var j = 0; j < ballsArray.length; j++) {
      if (ballsArray[j] === this) continue;
      const diffrence = diff(
        { xv: this.xv, yv: this.yv, radius: this.radius },
        {
          xv1: ballsArray[j].xv,
          yv1: ballsArray[j].yv,
          radius1: ballsArray[j].radius,
        }
      );
      if (diffrence < 0) {
        // collision happened
        const newV = resolveCollision(this, ballsArray[j]);
        if (newV) {
          this.Xvelocity = newV[0].Xvelocity;
          this.Yvelocity = newV[0].Yvelocity;
          ballsArray[j].Xvelocity = newV[1].Xvelocity;
          ballsArray[j].Yvelocity = newV[1].Yvelocity;
        }
      }
    }
    // coloring
    const mouseAndThisDiff = diff(
      { xv: this.xv, yv: this.yv },
      { xv1: mousePosition.x, yv1: mousePosition.y }
    );
    if (mouseAndThisDiff < coloringLength) {
      this.draw({ color: true, uncolor: false });
    } else {
      this.draw({ color: false, uncolor: true });
    }
  }
  draw({ color = false, uncolor = true }) {
    c.beginPath();
    c.arc(this.xv, this.yv, this.radius, Math.PI * 2, false);
    c.strokeStyle = this.color;
    c.stroke();

    if (color) {
      c.fillStyle = hex2rgba(this.color, this.alpha);
      if (this.alpha < 1) {
        this.alpha += random(0.01, 0.3);
      }
      c.fill();
    } else if (uncolor && this.alpha > 0) {
      c.fillStyle = hex2rgba(this.color, this.alpha);
      if (this.alpha > 0) {
        this.alpha -= random(0.01, 0.09);
      }
      c.fill();
    }

    c.closePath();
  }
}
// spawn loop
for (var i = 0; i < ballLimit; i++) {
  const config = {
    height: random(10, 40),
    width: this.height,
    color: colors[Math.round(random(0, 16))],
    Yvelocity: random(-3, 3),
    Xvelocity: random(-3, 3),
    radius: 20,
    xv: random(40, innerWidth - 40),
    yv: random(40, innerHeight - 40),
  };
  let overlap = false;
  let attemptsLeft = spawnAttempts;
  // check for collition
  while (attemptsLeft >= 0) {
    for (var j = 0; j < ballsArray.length; j++) {
      const diffrence = diff(
        { xv: config.xv, yv: config.yv, radius: config.radius },
        {
          xv1: ballsArray[j].xv,
          yv1: ballsArray[j].yv,
          radius1: ballsArray[j].radius,
        }
      );
      if (diffrence < 0) {
        overlap = true;
        break;
      }
    }
    attemptsLeft--;
  }
  if (!overlap) {
    ballsArray.push(new Ball(config));
  }
}
// animate ball1
function animate() {
  c.clearRect(0, 0, innerWidth, innerHeight);
  if (ballsArray.length > 0) {
    for (var i = 0; i < ballsArray.length; i++) {
      ballsArray[i].update(ballsArray);
    }
  }
  requestAnimationFrame(animate);
}
animate();
