// setup
ballLimit = 200;
let lightSpeedVelocityBoost = 0.0001;

// canvas setup
const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d"); // create a context
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let startAnimation = false;
// audio setup
let averageBars = 0;
const audioElement = document.getElementById("audio");
const source = "./assets/zedd.mp3";
const audio = new Audio(source);

let analyser, audioSourse, bufferLength, dataArray, audioCtx;

const drawArc = (up) => {
  c.beginPath();
  const shake = !startAnimation ? 0 : random(-1, 1);
  if (up) {
    c.arc(
      innerWidth / 2,
      innerHeight / 2 + shake,
      140,
      degrees_to_radians(200),
      degrees_to_radians(-20),
      false
    );
  } else {
    c.arc(
      innerWidth / 2,
      innerHeight / 2 + shake,
      140,
      degrees_to_radians(20),
      degrees_to_radians(160),
      false
    );
  }
  c.lineWidth = 3.5;
  addGlow("white");
  c.strokeStyle = "white";
  c.stroke();
  c.closePath();
  // the four lines
  if (up) {
    // upper circle
    lastX = innerWidth / 2 + 140 * Math.cos(degrees_to_radians(-20));
    lastY = innerHeight / 2 + 140 * Math.sin(degrees_to_radians(-20));
    // right
    c.beginPath();
    c.moveTo(lastX, lastY + shake);
    c.lineTo(lastX + 50, lastY + shake);
    addGlow("white");
    c.stroke();
    // left
    c.beginPath();
    c.moveTo(lastX - 131 * 2, lastY + shake);
    c.lineTo(lastX - 131 * 2 - 50, lastY + shake);
    addGlow("white");
    c.stroke();
  } else {
    // upper circle
    lastX = innerWidth / 2 + 140 * Math.cos(degrees_to_radians(160));
    lastY = innerHeight / 2 + 140 * Math.sin(degrees_to_radians(160));
    // right
    c.beginPath();
    c.moveTo(lastX, lastY);
    c.lineTo(lastX - 50, lastY);
    addGlow("white");
    c.stroke();
    // left
    c.beginPath();
    c.moveTo(lastX + 131 * 2, lastY);
    c.lineTo(lastX + 131 * 2 + 50, lastY);
    addGlow("white");
    c.stroke();
  }
};

const initBars = () => {
  audioSourse = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  audioSourse.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 128;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
};

canvas.onclick = () => {
  audioCtx = new AudioContext();
  initBars();
  startAnimation = !startAnimation;
  audio.play();
};

const drawCol = ({ barHeight, barWidth, degree, secondary }) => {
  const levels = Math.round(barHeight / 10);
  c.save();
  c.translate(innerWidth / 2, innerHeight / 2);
  c.rotate(degrees_to_radians(degree));
  for (var i = 0; i < levels; i++) {
    addGlow("white");
    c.fillStyle = hex2rgba(secondary, i * 0.1);
    c.fillRect(0, 10 * i + 10, barWidth, 10);
  }
  c.restore();
};

const animateBars = (secondary) => {
  // circles width / the amount of bars
  const barWidth = (2 * Math.PI * 100) / bufferLength;
  let barHeight;
  let degree = 0;
  // array of values between 0 and 255
  analyser.getByteFrequencyData(dataArray);
  averageBars =
    dataArray.reduce((prev, current) => prev + current, 0) + dataArray.length;
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 2 > 100 ? random(90, 100) : dataArray[i] / 2;
    drawCol({ barHeight, barWidth, degree, secondary });
    degree += 30 + i * 2;
  }
};
// the lines on the left and right side of the circle
const drawGuides = ({ start, end, addToInner }) => {
  if (addToInner) {
    c.save();
    c.translate(innerWidth / 2, innerHeight / 2);
    c.rotate(degrees_to_radians(270));
    addGlow("white");
    c.fillStyle = "#fff";
    c.fillRect(0, start, 5, end);
    c.restore();
  } else {
    c.save();
    c.translate(innerWidth / 2, innerHeight / 2);
    c.rotate(degrees_to_radians(90));
    addGlow("white");
    c.fillStyle = "#fff";
    c.fillRect(0, start, 5, end);
    c.restore();
  }
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
// degrees to rad
function degrees_to_radians(degrees) {
  return degrees * (Math.PI / 180);
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
const addGlow = (color) => {
  c.shadowColor = color;
  c.shadowBlur = 25;
  c.shadowOffsetX = 1;
  c.shadowOffsetY = 1;
};

// hex2rgba
const hex2rgba = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};
// text
class Zedd {
  constructor({ primaryColor = "#00cccc", secondaryColor = "#be2ed6" }) {
    this.primary = primaryColor;
    this.secondary = secondaryColor;
    this.alpha = 0;
    this.fadeSpeed = 0.005;
    this.rotationSpeed = 0.3;
    this.currentDegree = 0;
    this.degree = 0;
  }
  drawZedd() {
    // draw circle around the z
    c.beginPath();
    c.save();
    addGlow("black");
    c.arc(
      innerWidth / 2, //x
      innerHeight / 2, //y
      averageBars == 0 ? 120 : 110 + averageBars / 100, //radius
      0, //start angle
      Math.PI * 2, //end angle
      false
    );
    const gradient = c.createRadialGradient(
      innerWidth / 2,
      innerHeight / 2,
      50, //radius of the inner circle
      innerWidth / 2,
      innerHeight / 2,
      120 //radius of the outer cirlce
    );
    gradient.addColorStop(0, "#00cccc");
    gradient.addColorStop(
      averageBars == 0 ? 0.9 : 0.9 - Math.abs(averageBars / 10000),
      "#000"
    );
    c.fillStyle = gradient;
    c.fill();
    c.closePath();
    c.restore();
    // if the animation started draw some bars

    // draw z
    c.save();
    c.translate(innerWidth / 2, innerHeight / 2);
    if (startAnimation) {
      c.rotate(degrees_to_radians(this.degree));
      this.degree += this.rotationSpeed;
    }
    c.font = `${
      averageBars == 150 ? 150 : 150 + Math.abs(averageBars / 100)
    }px Ultra`;
    c.fillStyle = hex2rgba("#000000", this.alpha);
    c.rotate(degrees_to_radians(this.currentDegree));
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("z", 0, 0, innerHeight / 2);
    c.restore();

    // if the text is not fully visible add fade speed to the alpha
    if (this.alpha < 1) {
      this.alpha += this.fadeSpeed;
    }
  }
}

const zedd1 = new Zedd({});

////////////galaxy

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
    this.steem = 0.1;
    this.rad = Math.random() * Math.PI * 2;
  }
  update() {
    this.rad += this.velocity;
    this.xv = this.x + Math.cos(this.rad) * this.randomDistanceFromCenter;
    this.yv = this.y + Math.sin(this.rad) * this.randomDistanceFromCenter;
    this.draw();
  }
  draw() {
    c.beginPath();
    c.arc(this.xv, this.yv, this.radius * 5, Math.PI * 2, false);
    c.fillStyle = hex2rgba(this.color, this.steem);
    c.fill();
    c.closePath();

    // if the startAnimation is on and the steem tank isn't full start filling it up
    if (startAnimation) {
      if (this.velocity <= 0.009) {
        this.velocity += lightSpeedVelocityBoost;
      }
    }
    // if the startAnimation is off and there is steem in the tank use it
    else if (!startAnimation) {
      if (this.velocity > 0.009) {
        this.velocity -= lightSpeedVelocityBoost;
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
    velocity: 0.0009,
    radius: random(0.5, 1),
    xv: innerWidth / 2,
    yv: innerHeight / 2,
  };
  // add ball to the array
  ballsArray.push(new Ball(config));
}
// animate ball1
function animateGalaxy() {
  if (ballsArray.length > 0) {
    for (var i = 0; i < ballsArray.length; i++) {
      ballsArray[i].update();
    }
  }
}

const animationRoot = () => {
  animateGalaxy();
  drawArc(true);
  drawArc();

  zedd1.drawZedd();

  if (startAnimation) {
    animateBars("#ffffff");
    const randomValue = random(100, 200);
    drawGuides({ start: 140, end: randomValue, addToInner: true });
    drawGuides({ start: 140, end: randomValue, addToInner: false });
  } else {
    drawGuides({ start: 140, end: 150, addToInner: true });
    drawGuides({ start: 140, end: 150, addToInner: false });
  }
};
const animate = () => {
  c.clearRect(0, 0, innerWidth, innerHeight);
  // start the animation
  animationRoot();

  requestAnimationFrame(animate);
};
animate();
