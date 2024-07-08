class HandData {
	wrist;
	thumb;
	index;
	middle;
	ring;
	pinky;

	constructor(hand) {
		let fingertips = [WRIST, THUMB_TIP, INDEX_FINGER_TIP, MIDDLE_FINGER_TIP, RING_FINGER_TIP, PINKY_TIP];
		for (let i = 0; i < fingertips.length; i++) {
			let fingertip = hand[fingertips[i]];
			let x = map(fingertip.x, 0, 1, width, 0);
			let y = map(fingertip.y, 0, 1, 0, height);
			switch (fingertips[i]) {
				case WRIST:
					this.wrist = {x: x, y: y};
					break;
				case THUMB_TIP:
					this.thumb = {x: x, y: y};
					break;
				case INDEX_FINGER_TIP:
					this.index = {x: x, y: y};
					break;
				case MIDDLE_FINGER_TIP:
					this.middle = {x: x, y: y};
					break;
				case RING_FINGER_TIP:
					this.ring = {x: x, y: y};
					break;
				case PINKY_TIP:
					this.pinky = {x: x, y: y};
					break;
			}
		}
	}
}