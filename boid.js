class Flock {
	boids = [];
	run(chaser) {
		for (let i = 0; i < this.boids.length; i++) {
			this.boids[i].run(this.boids, chaser);
		}
	}

	addBoid(b) {
		this.boids.push(b);
	}

	changeColor() {
		// for (let i = 0; i < this.boids.length; i++) {
		for (let boid of this.boids) {
			boid.color = color(random(255), random(255), random(255));
		}
	}
}

class Boid {
	constructor(x, y) {
		this.acceleration = createVector(0, 0);
		this.velocity = createVector(random(-1, 1), random(-1, 1));
		this.position = createVector(x, y);
		this.r = 6;
		this.maxspeed = 3;
		this.maxforce = 0.05;
		this.color = color(127); // init color
	}

	run(boids, chaser) {
		this.flock(boids, chaser);
		this.update();
		this.borders();
		this.render();
	}

	applyForce(force) {
		this.acceleration.add(force);
	}

	flock(boids, chaser) {
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

	update() {
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxspeed);
		this.position.add(this.velocity);
		this.acceleration.mult(0);
	}

	seek(target) {
		let desired = p5.Vector.sub(target, this.position);
		desired.normalize();
		desired.mult(this.maxspeed);
		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxforce);
		return steer;
	}

	flee(target) {
		let desired = p5.Vector.sub(this.position, target);
		desired.normalize();
		desired.mult(this.maxspeed);
		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxforce);
		return steer;
	}

	render() {
		let theta = this.velocity.heading() + radians(90);
		fill(this.color);
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

	borders() {
		if (this.position.x < -this.r) this.position.x = width + this.r;
		if (this.position.y < -this.r) this.position.y = height + this.r;
		if (this.position.x > width + this.r) this.position.x = -this.r;
		if (this.position.y > height + this.r) this.position.y = -this.r;
	}

	separate(boids) {
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

	align(boids) {
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

	cohesion(boids) {
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
}

class Chaser {
	constructor(x, y) {
		this.position = createVector(x, y);
		this.r = 16; // Size of the chaser
	}

	updatePosition(target) {
		this.position = target.copy();
	}

	display() {
		fill('blue');
		ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
	}
}