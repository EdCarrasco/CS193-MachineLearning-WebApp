class NodeManager {
	constructor() {
		this.nodes = []
		this.k = 3
		this.nearestNodes = []
	}

	setK(k) {
		this.k = k
	}

	update() {
		this.nearestNodes = [] // reset
		for (let i = 0; i < nodes.length; i++) {
			this.nodes[i].update()
		}

	}

	draw() {
		for (let i = 0; i < nodes.length; i++) {
			this.nodes[i].draw()
		}
	}
}