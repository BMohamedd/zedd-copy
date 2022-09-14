const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d"); // create a context
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ballLimit = 100;
let lightSpeed = false;
let lightSpeedVelocityBoost = 0.01;
const mousePosition = {
  x: 9999999,
  y: 9999999,
};

document.addEventListener("mousemove", (e) => {
  mousePosition.x = e.x;
  mousePosition.y = e.y;
  return;
});
document.onmousedown = () => {
  lightSpeed = true;
};
document.onmouseup = () => {
  lightSpeed = false;
};

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
    xv = innerWidth / 2,
    yv = innerHeight / 2,
    radius = 40,
    color = "black",
    velocity = 0.1,
  }) {
    this.randomDistanceFromCenter = random(10, innerWidth / 2);
    this.xv = xv;
    this.yv = yv;
    this.x = innerWidth / 2;
    this.y = innerHeight / 2;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.steem = 0;
    this.rad = Math.random() * Math.PI * 2;
  }
  update() {
    this.rad += this.velocity;
    this.xv = this.x + Math.cos(this.rad) * this.randomDistanceFromCenter;
    this.yv = this.y + Math.sin(this.rad) * this.randomDistanceFromCenter;
    this.draw();
  }
  draw() {
    if (this.steem > 0 || lightSpeed) {
      // glow
      c.beginPath();
      c.arc(this.xv, this.yv, this.radius * 5, Math.PI * 2, false);
      c.fillStyle = hex2rgba(this.color, this.steem);
      c.fill();
      c.closePath();
      // if the lightspeed is on and the steem tank isn't full start filling it up
      if (this.steem < 0.06 && lightSpeed) {
        this.steem += 0.001;
        if (this.velocity <= 0.009) {
          this.velocity += lightSpeedVelocityBoost;
        }
      }
      // if the lightspeed is off and there is steem in the tank use it
      else if (!lightSpeed) {
        this.steem -= 0.0005;
        if (this.steem < 0.009) {
          this.steem = 0;
        }
        if (this.velocity > 0.009) {
          this.velocity -= lightSpeedVelocityBoost;
        }
      }
    }
    // circle
    c.beginPath();
    c.arc(this.xv, this.yv, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }
}
// spawn loop
for (var i = 0; i < ballLimit; i++) {
  const config = {
    width: this.height,
    color: colors[Math.round(random(0, 16))],
    velocity: 0.009,
    radius: random(0.5, 1),
    xv: innerWidth / 2,
    yv: innerHeight / 2,
  };
  // add ball to the array
  ballsArray.push(new Ball(config));
}
// animate ball1
function animate() {
  if (lightSpeed) {
    c.fillStyle = "rgba(0, 0, 0, 0.1)";
  } else {
    c.fillStyle = "rgba(0, 0, 0, 1)";
  }
  c.fillRect(0, 0, innerWidth, innerHeight);
  if (ballsArray.length > 0) {
    for (var i = 0; i < ballsArray.length; i++) {
      ballsArray[i].update();
    }
  }
  requestAnimationFrame(animate);
}
animate();
