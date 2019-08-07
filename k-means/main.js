function setup() {
	let canvas = createCanvas(740, 380)
	canvas.parent('canvas-container')
	document.getElementById('file-open').addEventListener('change', handleFileSelect, false)
	buttonProcessNext = document.getElementById('button-process-next')
	buttonProcessReset = document.getElementById('button-process-reset')

	// K-MEANS ALGORITHM STEPS MENU
	nodeManager = new NodeManager()
	stepManager = new StepManager(580,10)
	stepManager.addStep("1. Initialize clusters\n      randomly")
	stepManager.addStep("2. For each point,\n      find its closest cluster")
	stepManager.addStep("3. For each cluster,\n      move it to its center")
	stepManager.addStep("4. If no clusters moved,\n      algorithm is done")
}

function buttonProcessNextFunc() {
	
	
}

function updateClusteringNoiseLabel() {
	let slider = document.getElementById('slider-noise')
	let label = document.getElementById('label-noise')
	label.innerHTML = round(slider.value * 100) + "%"
}

function draw() {
	background(200)
	frameRate(FRAMERATE)

	buttonProcessNext.disabled = !(nodeManager.nodes.length > 0) || !nodeManager.hasMoved
	buttonProcessReset.disabled = (nodeManager.currentStep == 0) ? true : false

	updateClusteringNoiseLabel()

	nodeManager.update()
	nodeManager.draw()

	let pos = createVector(mouseX,mouseY)
	nodeManager.findKNN(pos)

	//drawDebugText()
	//drawTempClusters()

	stepManager.draw()
}

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