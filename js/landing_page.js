//https://www.youtube.com/watch?v=p0I5bNVcYP8
const numStars = 500;
let stars = [];
let animationDuration = 3000; // 3 seconds
let startTime;

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(255);
  strokeWeight(2);
  
  for(let i = 0; i < numStars; i ++) {
    stars.push(new Star(random(width), random(height)));
  }
  
  startTime = millis();
}

function draw() {
  let currentTime = millis();
  let elapsedTime = currentTime - startTime;
  
  if (elapsedTime > animationDuration) {
    document.querySelector('.container').style.display = 'block'; // Show the container
  }
  
  background(0, 50);
  
  // Fast movement for the first 2 seconds, then slow down
  let acc;
  if (elapsedTime < animationDuration) {
    acc = map(elapsedTime, 0, animationDuration, 0.2, 0.005);
  } else {
    acc = 0.005;
  }
  
  stars = stars.filter(star => {
    star.draw();
    star.update(acc);
    return star.isActive();
  });
  
  while(stars.length < numStars) {
    stars.push(new Star(random(width), random(height)));
  }
}

class Star {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.prevPos = createVector(x, y);
    
    this.vel = createVector(0, 0);
    
    this.ang = atan2(y - (height/2), x - (width/2));
  }
  
  isActive() {
    return onScreen(this.prevPos.x, this.prevPos.y);
  }
  
  update(acc) {
    this.vel.x += cos(this.ang) * acc;
    this.vel.y += sin(this.ang) * acc;
    
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
    
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
  
  draw() {
    const alpha = map(this.vel.mag(), 0, 3, 0, 255);
    stroke(255, alpha);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
  }
}

function onScreen(x, y) {
  return x >= 0 && x <= width && y >= 0 && y <= height;  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}