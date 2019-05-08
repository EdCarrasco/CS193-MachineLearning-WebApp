class NodeManager {
	constructor() {
		this.nodes = []
		this.clusters = []
		this.tempClusters = []

		this.k = 3
		this.numClusters = 5
		
		this.nearestNodes = []
		this.currentClass = 0
		
		this.isClustering = false
		this.clusteringNoise = 0.1
		this.clusteringFactor = 0.9

		this.currentStep = 0
		this.isProcessPlaying = false
		this.hasMoved = true

		this.LAST_STEP = 9 // must match the last case # in processStep()
	}

	processPlay() {
		this.isProcessPlaying = true
	}

	processStop() {
		this.isProcessPlaying = false
	}

	

	setK(k) {
		this.k = k
	}

	setClusters(value) {
		this.numClusters = value
	}

	setClusteringNoise(value) {
		if (value > 1) value = 1
		else if (value < 0) value = 0
		this.clusteringNoise = value

	}

	setClusteringFactor(value) {
		if (value > 1) value = 1
		else if (value < 0) value = 0
		this.clusteringFactor = value
	}

	setClass(nodeclass) {
		this.currentClass = nodeclass
	}

	findKNN(position) {
		if (position == null || 
			position.x < 0 || position.x > width || 
			position.y < 0 || position.y > height) {
			return
		}
		this.sortByDistance(this.nodes, position)
		let k = min(this.nodes.length, this.k)
		for (let i = 0; i < k; i++) {
			push()
			stroke(this.nodes[i].color)
			strokeWeight(1)
			line(position.x, position.y, this.nodes[i].position.x, this.nodes[i].position.y)
			pop()
		}
	}

	sortByDistance(array, position) {
		array.sort((a,b)=>(a.distanceTo(position) > b.distanceTo(position)) ? 1 : -1)
	}

	generatePointsUniform(numPoints, xrange, yrange) {
		this.nodes = []
		let xmax = floor(width*xrange)
		let ymax = floor(height*yrange)
		for (let i = 0; i < numPoints; i++) {
			let x = randomBounded(0,width)
			let y = randomBounded(0,height)
			let point = createVector(x, y)
			let nodeclass = 0
			let node = new Node(point, nodeclass)
			this.nodes.push(node)
		}
	}

	generatePointsClustered(numPoints, numClusters) {
		// Generate some temporary cluster centers
		this.tempClusters = []
		for (let k = 0; k < numClusters; k++) {
			let x = randomBounded(0,width)
			let y = randomBounded(0,height)
			let point = createVector(x,y)
			let node = new Node(point, 0, 'TEMP')
			this.tempClusters.push(node)
		}

		// Generate points around the cluster centers
		this.nodes = []
		let numNoisePoints = floor(numPoints*this.clusteringNoise)
		let numPointsPerCluster = floor((numPoints-numNoisePoints)/numClusters)
		for (let k = 0; k < this.tempClusters.length; k++) {
			let halfwidth = (width/numClusters) * 0.5
			let halfheight = (height/numClusters) * 0.5

			for (let i = 0; i < numPointsPerCluster; i++) {
				let xmin = max(0, this.tempClusters[k].position.x-halfwidth)
				let xmax = min(width, this.tempClusters[k].position.x+halfwidth)
				let ymin = max(0, this.tempClusters[k].position.y-halfheight)
				let ymax = min(height, this.tempClusters[k].position.y+halfheight)
				let x = randomBounded(xmin,xmax)
				let y = randomBounded(ymin,ymax)
				let p = createVector(x,y)
				let node = new Node(p, 0)
				this.nodes.push(node)

				// increase half width and height by % of half the max width or max height
				// divide half max width by numPointsPerCluster
				let widthIncrease = (width*0.5)/numPointsPerCluster
				let heightIncrease = (height*0.5)/numPointsPerCluster
				halfwidth += widthIncrease * (1 - this.clusteringFactor)
				halfheight += heightIncrease * (1 - this.clusteringFactor)
			}
		}


		// Generate points randomly as noise
		for (let i = 0; i < numNoisePoints; i++) {
			let x = randomBounded(0,width)
			let y = randomBounded(0,height)
			let point = createVector(x, y)
			let node = new Node(point, 0)
			this.nodes.push(node)
		}
	}

	initializeClusters() {
		this.clusters = []
		if (this.numClusters < 1) {
			this.removeClusters()
		}

		// STEP 0: randomize cluster center positions
		for (let k = 0; k < this.numClusters; k++) {
			let x = floor(random()*1000)%width
			let y = floor(random()*1000)%height
			let point = createVector(x, y)
			let nodeclass = k+1
			let node = new Node(point, nodeclass, 'CLUSTER')
			this.clusters.push(node)
		}

		this.isClustering = true
	}

	removeClusters() {
		this.isClustering = false
		this.clusters = []
		for (let node of this.nodes) {
			node.nodeclass = 0
		}
		this.currentStep = 0
	}

	matchNodesWithClusters() {
		console.log("this.clusters.length: "+this.clusters.length)
		// STEP 1: each point finds distance to each cluster center
		for (let i = 0; i < this.nodes.length; i++) {
			let smallestDistance = Infinity
			for (let k = 0; k < this.clusters.length; k++) {
				let distance = this.nodes[i].distanceTo(this.clusters[k].position)
				if (distance < smallestDistance) {
					smallestDistance = distance
					this.nodes[i].nodeParent = this.clusters[k]
					//this.nodes[i].nodeclass = this.clusters[k].nodeclass
				}
			}
		}

		// STEP 2: each cluster is assigned the closest points to it
		for (let k = 0; k < this.clusters.length; k++) {
			this.clusters[k].nodeChildren = []
		}
		for (let i = 0; i < this.nodes.length; i++) {
			//let k = this.nodes[i].nodeclass - 1
			//console.log(this.clusters)
			//console.log(k)
			//this.clusters[k].nodeChildren.push(this.nodes[i])
			this.nodes[i].nodeParent.nodeChildren.push(this.nodes[i])
			this.nodes[i].nodeclass = this.nodes[i].nodeParent.nodeclass
		}
	}

	moveClusterCenters() {
		// STEP 3: move each cluster center to the mean position
		for (let k = 0; k < this.clusters.length; k++) {
			let children = this.clusters[k].nodeChildren
			if (children.length < 1) continue
			let xaverage = 0
			let yaverage = 0
			for (let j = 0; j < children.length; j++) {
				xaverage += children[j].position.x
				yaverage += children[j].position.y
			}
			xaverage /= children.length
			yaverage /= children.length
			let newPosition = createVector(xaverage,yaverage)
			this.clusters[k].prevposition = this.clusters[k].position
			this.clusters[k].position = newPosition
		}
	}

	checkClusterMovement() {
		// STEP 4: if no changes, stop clustering process
		this.hasMoved = false
		for (var k = 0; k < this.clusters.length; k++) {
			if (this.clusters[k].position.x != this.clusters[k].prevposition.x ||
				this.clusters[k].position.y != this.clusters[k].prevposition.y) {
				this.hasMoved = true
			}
		}

		if (this.hasMoved == false) {
			this.currentStep = this.LAST_STEP
		}
	}

	resetClustering() {
		this.clusters = []
		for (let node of this.nodes) {
			node.nodeParent = null
			node.nodeclass = 0
		}
		this.currentStep = 0
		this.hasMoved = true
		this.isProcessPlaying = false
	}

	processPause() {
		this.isProcessPlaying = false
	}

	restartProcessLoop() {
		if (this.currentStep > 3) {
			this.currentStep = 3 // loop start
			this.hasMoved = true
		}
	}

	processStep() {
		switch(this.currentStep) {
			case 0:
				// first step. wait for button press to actually start
				if (this.isProcessPlaying) this.processNext()
				break
			case 1:
				this.initializeClusters()
				this.processNext()
				break
			case 2:
				if (this.isProcessPlaying) this.processNext()
				break;
			case 3:
				this.matchNodesWithClusters()
				this.processNext()
				break
			case 4:
				if (this.isProcessPlaying) this.processNext()
				break
			case 5:
				this.moveClusterCenters()
				this.processNext()
				break
			case 6:
				if (this.isProcessPlaying) this.processNext()
				break
			case 7:
				this.checkClusterMovement()
				this.processNext()
				break
			case 8:
				if (this.isProcessPlaying) this.processNext()
				break
			case 9:
				this.lastStep()
				break
			default:
				break
		}
	}

	lastStep() {
		// do nothing for now
	}

	processNext() {
		let loopEnd = 8		// last step that is part of the loop
		let loopStart = 3	// first step that is part of the loop
		if (this.currentStep < loopEnd) {
			this.currentStep++
		} else if (this.currentStep == loopEnd) {
			this.currentStep = loopStart
		} else {
			// you are beyond the loop
			// reset() must be called from here
		}
	}

	runClustering() {
		this.processStep()
		
	}

	update() {
		for (let node of this.nodes) node.update()
		for (let cluster of this.clusters) cluster.update()
		for (let temp of this.tempClusters) temp.update()

		this.runClustering()
	}

	draw() {
		for (let node of this.nodes) node.draw()
		for (let cluster of this.clusters) cluster.draw()
		for (let temp of this.tempClusters) temp.draw()

		this.findKNN()
	}

	drawLines() {
		push()
		for (let node of this.nodes) {
			for (let cluster of this.clusters) {
				strokeWeight(1)
				stroke(cluster.color)
				line(node.position.x, node.position.y, cluster.position.x, cluster.position.y)
			}
		}
		pop()
	}
}