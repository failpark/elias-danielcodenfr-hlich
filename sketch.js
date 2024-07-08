// sketch.js
let myHandLandmarker;
let handLandmarks;
let myCapture;
let lastVideoTime = -1;

let flock;
let chaser;
let startTime = 0;
let chasingActivated = false;

const trackingConfig = {
  doAcquireHandLandmarks: true,
  cpuOrGpuString: "GPU",
  maxNumHands: 1,
};

async function preload() {
  const mediapipe_module = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js');
  
  HandLandmarker = mediapipe_module.HandLandmarker;
  FilesetResolver = mediapipe_module.FilesetResolver;
  
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm"
  );

  if (trackingConfig.doAcquireHandLandmarks){
    const handModel = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
    myHandLandmarker = await HandLandmarker.createFromOptions(vision, {
      numHands: trackingConfig.maxNumHands,
      runningMode: "VIDEO",
      baseOptions: {
        modelAssetPath: handModel,
        delegate: trackingConfig.cpuOrGpuString,
      },
    });
  }
} 

async function predictWebcam() {
  let startTimeMs = performance.now();
  if (lastVideoTime !== myCapture.elt.currentTime) {
    if (trackingConfig.doAcquireHandLandmarks && myHandLandmarker) {
      handLandmarks = myHandLandmarker.detectForVideo(myCapture.elt, startTimeMs);
    }
    lastVideoTime = myCapture.elt.currentTime;
  }
  window.requestAnimationFrame(predictWebcam);
}

function setup() {
  createCanvas(windowHeight * 132 / 99, windowHeight);
  myCapture = createCapture(VIDEO);
  myCapture.size(320, 240);
  myCapture.hide();
  noStroke();
  textSize(16);
  fill(0);

  flock = new Flock();
  for (let i = 0; i < 100; i++) {
    flock.addBoid(new Boid(random(width), random(height)));
  }
  chaser = new Chaser(width / 2, height / 2);
}

function draw() {
  background(200);
  drawVideoBackground();
  predictWebcam();
  drawHandPoints();
  drawDiagnosticInfo();

  if (handLandmarks && handLandmarks.landmarks && handLandmarks.landmarks.length > 0) {
    let wrist = handLandmarks.landmarks[0][0];
    let ringFingerTip = handLandmarks.landmarks[0][16];
    let thumbTip = handLandmarks.landmarks[0][4];
    let pinkyTip = handLandmarks.landmarks[0][20];
    let x = map(wrist.x, 0, 1, width, 0);
    let y = map(wrist.y, 0, 1, 0, height);
    let ringX = map(ringFingerTip.x, 0, 1, width, 0);
    let ringY = map(ringFingerTip.y, 0, 1, 0, height);
    let thumbX = map(thumbTip.x, 0, 1, width, 0);
    let thumbY = map(thumbTip.y, 0, 1, 0, height);
    let pinkyX = map(pinkyTip.x, 0, 1, width, 0);
    let pinkyY = map(pinkyTip.y, 0, 1, 0, height);

    chaser.updatePosition(createVector(x, y));

    fill("red");
    ellipse(ringX, ringY, 10, 10); // Display the ring finger tip

    fill("blue");
    ellipse(thumbX, thumbY, 10, 10); // Display the thumb tip
    ellipse(pinkyX, pinkyY, 10, 10); // Display the pinky tip

    let wristRingDistance = dist(x, y, ringX, ringY);
    let thumbPinkyDistance = dist(thumbX, thumbY, pinkyX, pinkyY);

    fill(0);
    text(`Distance Wrist-RingFinger: ${wristRingDistance.toFixed(2)}`, 10, 60);
    text(`Distance Thumb-Pinky: ${thumbPinkyDistance.toFixed(2)}`, 10, 80);
    text(`Chasing activ: ${chasingActivated}`, 10, 120);
    
    if (wristRingDistance < 50) {
      createP("New Fish Added!");
      flock.addBoid(new Boid(x, y));
    }

    if (thumbPinkyDistance > 500) {
      if (chasingActivated) {
        for (let boid of flock.boids) {
          let flee = boid.flee(chaser.position);
          boid.applyForce(flee);
        }
      }
    } else {
      if (chasingActivated) {
        for (let boid of flock.boids) {
          let chase = boid.seek(chaser.position);
          chase.mult(1.5);
          boid.applyForce(chase);
        }
      }
    }
  }

  chaser.display();
  flock.run(chaser);

  let nearestDist = Infinity;
  for (let boid of flock.boids) {
    let d = dist(chaser.position.x, chaser.position.y, boid.position.x, boid.position.y);
    if (d < nearestDist) {
      nearestDist = d;
    }
  }

  if (!chasingActivated && nearestDist < 50) {
    startTime = millis();
    chasingActivated = true;
  } else if (nearestDist >= 50) {
    chasingActivated = false;
  }

  fill(0);
  text(`Distance to nearest boid: ${nearestDist.toFixed(2)}`, 10, 20);
  if (chasingActivated) {
    text(`Time near: ${(millis() - startTime) / 1000}s`, 10, 40);
  } else {
    text(`Time near: 0s`, 10, 40);
  }
}

function drawVideoBackground() {
  push();
  translate(width, 0);
  scale(-1, 1);
  tint(255, 255, 255, 72);
  image(myCapture, 0, 0, width, height);
  tint(255);
  pop();
}

function drawHandPoints() {
  if (trackingConfig.doAcquireHandLandmarks) {
    if (handLandmarks && handLandmarks.landmarks) {
      const nHands = handLandmarks.landmarks.length;
      if (nHands > 0) {
        for (let h = 0; h < nHands; h++) {
          let hand = handLandmarks.landmarks[h];
          let wrist = hand[0];
          let x = map(wrist.x, 0, 1, width, 0);
          let y = map(wrist.y, 0, 1, 0, height);
          fill("green");
          noStroke();
          ellipse(x, y, 20, 20);
        }
      }
    }
  }
}

function drawDiagnosticInfo() {
  noStroke();
  fill("black");
  textSize(12);
  text("FPS: " + int(frameRate()), 40, 30);
}

function Flock() {
  this.boids = [];
}

Flock.prototype.run = function(chaser) {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids, chaser);
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 6;
  this.maxspeed = 3;
  this.maxforce = 0.05;
}

Boid.prototype.run = function(boids, chaser) {
  this.flock(boids, chaser);
  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  this.acceleration.add(force);
}

Boid.prototype.flock = function(boids, chaser) {
  let sep = this.separate(boids);
  let ali = this.align(boids);
  let coh = this.cohesion(boids);

  if (chasingActivated) {
    let chase = this.seek(chaser.position);
    chase.mult(1.5);
    this.applyForce(chase);
    fill("blue");
  }

  sep.mult(1.5);
  ali.mult(1);
  coh.mult(1);

  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

Boid.prototype.update = function() {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
}

Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);
  return steer;
}

Boid.prototype.flee = function(target) {
  let desired = p5.Vector.sub(this.position, target);
  desired.normalize();
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);
  return steer;
}

Boid.prototype.render = function() {
  let theta = this.velocity.heading() + radians(90);
  fill(127);
  stroke(200);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
}

Boid.prototype.borders = function() {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

Boid.prototype.separate = function(boids) {
  let desiredseparation = 37.5;
  let steer = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < desiredseparation)) {
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d); // Weight by distance
      steer.add(diff);
      count++;
    }
  }
  if (count > 0) {
    steer.div(count);
  }

  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

Boid.prototype.align = function(boids) {
  let neighbordist = 250;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

Boid.prototype.cohesion = function(boids) {
  let neighbordist = 500;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);
  } else {
    return createVector(0, 0);
  }
}

function Chaser(x, y) {
  this.position = createVector(x, y);
  this.r = 16; // Size of the chaser
}

Chaser.prototype.updatePosition = function(target) {
  this.position = target.copy();
}

Chaser.prototype.display = function() {
  fill(255, 0, 0);
  ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
}
