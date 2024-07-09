// sketch.js
let myHandLandmarker;
let handLandmarks;
let myCapture;
let lastVideoTime = -1;

let obstacles = [];
let lock_rotation = false;

let flock; // global flock
let chaser; // ?
let startTime = 0;
let chasingActivated = false;

const trackingConfig = {
	doAcquireHandLandmarks: true,
	poseModelLiteOrFull: "full" /* "lite" (3MB) or "full" (6MB) */,
	cpuOrGpuString: "GPU",
	maxNumHands: 1,
	showWebcamBackground: true,
	showFingerTips: true,
};

async function preload() {
	const mediapipe_module = await import(
		"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js"
	);

	HandLandmarker = mediapipe_module.HandLandmarker;
	FilesetResolver = mediapipe_module.FilesetResolver;

	const vision = await FilesetResolver.forVisionTasks(
		"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm"
	);

	if (trackingConfig.doAcquireHandLandmarks) {
		const handModel =
			"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
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
			handLandmarks = myHandLandmarker.detectForVideo(
				myCapture.elt,
				startTimeMs
			);
		}
		lastVideoTime = myCapture.elt.currentTime;
	}
	window.requestAnimationFrame(predictWebcam);
}

function setup() {
	createCanvas((windowHeight * 132) / 99, windowHeight);
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
	background(200); // Light gray background
	predictWebcam();
	drawVideoBackground();
	drawHandPoints();
	drawDiagnosticInfo();

	// if (false) {
	if (
		handLandmarks &&
		handLandmarks.landmarks &&
		handLandmarks.landmarks.length > 0
	) {
		// we assume that there is only one hand
		let data = new HandData(handLandmarks.landmarks[0]);
		chaser.updatePosition(createVector(data.wrist.x, data.wrist.y));

		let wristRingDistance = dist(
			data.wrist.x,
			data.wrist.y,
			data.ring.x,
			data.ring.y
		);
		let thumbPinkyDistance = dist(
			data.thumb.x,
			data.thumb.y,
			data.pinky.x,
			data.pinky.y
		);

		fill(0);
		text(`Distance Wrist-RingFinger: ${wristRingDistance.toFixed(2)}`, 10, 60);
		text(`Distance Thumb-Pinky: ${thumbPinkyDistance.toFixed(2)}`, 10, 80);
		text(`Chasing activ: ${chasingActivated}`, 10, 120);

		if (wristRingDistance < 120) {
			createP("New Fish Added!");
			flock.addBoid(new Boid(data.wrist.x, data.wrist.y));
		}

		// in function draw (steht schon in boids_game_2024_07_08)
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

		if (!lock_rotation) {
			if (data.thumb.x > data.pinky.x) {
				lock_rotation = true;
				console.log(flock);
				flock.changeColor();
				console.log(flock);
			}
		} else {
			if (data.thumb.x < data.pinky.x) {
				lock_rotation = false;
			}
		}

		if (
			data.thumb.y > data.wrist.y &&
			data.index.y > data.wrist.y &&
			data.middle.y > data.wrist.y &&
			data.ring.y > data.wrist.y &&
			data.pinky.y > data.wrist.y
		) {
			spawnObstacle(data.wrist.x, data.wrist.y);
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
	drawObstacles();

	let nearestDist = Infinity;
	for (let boid of flock.boids) {
		let d = dist(
			chaser.position.x,
			chaser.position.y,
			boid.position.x,
			boid.position.y
		);
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
					let wrist = hand[WRIST];
					let x = map(wrist.x, 0, 1, width, 0);
					let y = map(wrist.y, 0, 1, 0, height);
					fill("blue");
					noStroke();
					ellipse(x, y, 20, 20);

					// Draw fingertip points if enabled
					if (trackingConfig.showFingerTips) {
						let fingertips = [
							THUMB_TIP,
							INDEX_FINGER_TIP,
							MIDDLE_FINGER_TIP,
							RING_FINGER_TIP,
							PINKY_TIP,
						];
						for (let i = 0; i < fingertips.length; i++) {
							let fingertip = hand[fingertips[i]];
							x = map(fingertip.x, 0, 1, width, 0);
							y = map(fingertip.y, 0, 1, 0, height);
							switch (fingertips[i]) {
								case THUMB_TIP:
								case PINKY_TIP:
									fill("green");
									break;
								default:
									fill("red");
									break;
							}
							ellipse(x, y, 10, 10);
						}
					}
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

function spawnObstacle(x, y) {
	obstacles.push(createVector(x, y));
}

function drawObstacles() {
	fill("purple");
	for (let obstacle of obstacles) {
		ellipse(obstacle.x, obstacle.y, 30, 30);
	}
}
