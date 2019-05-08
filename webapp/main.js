let nodeManager = null
let buttonProcessNext = null
let buttonProcessReset = null

function setup() {
	let canvas = createCanvas(640, 380)
	canvas.parent('canvas-container')
	document.getElementById('file-open').addEventListener('change', handleFileSelect, false)
	buttonProcessNext = document.getElementById('button-process-next')
	buttonProcessReset = document.getElementById('button-process-reset')

	nodeManager = new NodeManager()
}

function buttonProcessNextFunc() {
	let enabled = (nodeManager.nodes.length > 0) && nodeManager.hasMoved
	buttonProcessNext.disabled = !enabled
}

function updateClusteringNoiseLabel() {
	let slider = document.getElementById('slider-noise')
	let label = document.getElementById('label-noise')
	label.innerHTML = round(slider.value * 100) + "%"
}

function draw() {
	background(200)
	frameRate(FRAMERATE)

	buttonProcessNextFunc()
	buttonProcessNext.innerHTML = "Next (current: " + nodeManager.currentStep + ")"
	buttonProcessReset.disabled = (nodeManager.currentStep == 0) ? true : false

	updateClusteringNoiseLabel()

	nodeManager.update()
	nodeManager.runClustering()
	nodeManager.draw()

	


	/*if (clusterNodes.length < 1) {
		for (let node of nodes) {
			node.nodeclass = 0 // TODO: CHANGE BACK TO ORIGINAL CLASS
		}
		return
	}*/

	let pos = createVector(mouseX,mouseY)
	nodeManager.findKNN(pos)
	nodeManager.runClustering()

	drawDebugText()
	drawTempClusters()
}

/*function findKNN(pos) {
	nodes.sort((a,b) => (a.distanceTo(pos) > b.distanceTo(pos)) ? 1 : -1)
	let numKNN = min(nodes.length, knn) // k nearest neighbors
	for (let i = 0; i < numKNN; i++) {
		push()
		stroke(nodes[i].color)
		strokeWeight(1)
		line(pos.x, pos.y, nodes[i].position.x, nodes[i].position.y)
		pop()
	}
}

function runClustering() {
	if (clustering == true && nodes.length > 0 && clusterNodes.length > 0) {
		for (let j = 0; j < clusterNodes.length; j++) {
			clusterNodes[j].nodeChildren = []
		}
		for (let i = 0; i < nodes.length; i++) {
			let smallestDistance = Infinity
			for (let j = 0; j < clusterNodes.length; j++) {
				let dist = nodes[i].distanceTo(clusterNodes[j].position)
				if (dist < smallestDistance) {
					smallestDistance = dist
					nodes[i].nodeclass = clusterNodes[j].nodeclass
				}
			}
			let j = nodes[i].nodeclass - 1
			clusterNodes[j].nodeChildren.push(nodes[i])
		}
		for (let j = 0; j < clusterNodes.length; j++) {
			let children = clusterNodes[j].nodeChildren
			if (children.length == 0)
				continue
			let xaverage = 0
			let yaverage = 0
			for (let i = 0; i < children.length; i++) {
				xaverage += children[i].position.x
				yaverage += children[i].position.y
			}
			xaverage /= children.length
			yaverage /= children.length
			clusterNodes[j].position = createVector(xaverage,yaverage)
		}
	}
}*/

function drawDebugText() {
	push()
	let x = 2
	let y = 11
	text("framerate: "+floor(getFrameRate()), x, y)
	y += 15
	text("# nodes: "+nodeManager.nodes.length, x, y)
	y += 15
	text("hasMoved: "+nodeManager.hasMoved, x, y)
	y += 15
	text("isProcessPlaying: "+nodeManager.isProcessPlaying, x, y)
	y += 15
	pop()
}

function drawTempClusters() {
	for (let k = 0; k < tempClusters.length; k++) {
		push()
		translate(tempClusters[k].position)
		fill('black')
		ellipse(0,0,5)
		pop()
	}
}