function mousePressed() {
	if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
		return
	}

	if (nodeManager.allowsNewPoints) {
		let p = createVector(mouseX, mouseY)
		let node = new Node(p, nodeManager.currentClass)
		nodeManager.nodes.push(node)
		nodeManager.restartProcessLoop()
	}
}

function processPlay() {
	nodeManager.processPlay()
}

function processPause() {
	nodeManager.processPause()
}

function processNext() {
	nodeManager.processNext()
	let button = document.getElementById('button-process-next')
	let step = nodeManager.currentStep + 1
	//button.innerHTML = "Next (" + step + ")"
}

function generatePoints(num,xrange,yrange) {
	console.log("generate Points Uniform")
	nodeManager.generatePointsUniform(num,xrange,yrange)
	clusterGraph.initialize()
	nodeManager.restartProcessLoop()
}
/*function generatePoints(num,xrange,yrange) {
	nodes = []
	let xmax = floor(width*xrange)
	let ymax = floor(height*yrange)
	for (let i = 0; i < num; i++) {
		//let x = floor(random()*1000)%width
		//let y = floor(random()*1000)%height
		let x = randomBounded(0,width)
		let y = randomBounded(0,height)
		let p = createVector(x, y)
		let node = new Node(p, 0)
		//console.log(node)
		nodes.push(node)
	}
}*/

function generatePointsClustered(numPoints, numClusters) {
	nodeManager.generatePointsClustered(numPoints,numClusters)
	nodeManager.restartProcessLoop()
}

/*function generatePointsClustered(numPoints, numClusters, noise) {
	noise = (noise != null) ? noise : NOISE
	console.log("noise: "+noise)
	// generate some clusters
	tempClusters = []
	for (let i = 0; i < numClusters; i++) {
		//let x = floor(random()*1000)%width
		//let y = floor(random()*1000)%height
		let x = randomBounded(0,width)
		let y = randomBounded(0,height)
		let p = createVector(x,y)
		let node = new Node(p, 0, true)
		tempClusters.push(node)
	}

	// generate points around clusters
	nodes = []
	let numNoisePoints = floor(numPoints*noise)
	let numPointsPerCluster = floor((numPoints-numNoisePoints)/numClusters)
	
	//console.log(w + " " + h)
	//background(255)
	for (let k = 0; k < tempClusters.length; k++) {
		let halfwidth = (width/numClusters) * 0.5
		let halfheight = (height/numClusters) * 0.5
		for (let j = 0; j < numPointsPerCluster; j++) {
			let xmin = max(0, tempClusters[k].position.x-halfwidth)
			let xmax = min(width, tempClusters[k].position.x+halfwidth)
			let ymin = max(0, tempClusters[k].position.y-halfheight)
			let ymax = min(height, tempClusters[k].position.y+halfheight)
			let x = randomBounded(xmin,xmax)
			let y = randomBounded(ymin,ymax)
			let p = createVector(x,y)
			let node = new Node(p, 0)
			nodes.push(node)
			if (j==0 && k==0) {
				console.log(tempClusters)
				console.log(xmax)
			}

			// increase half width and height by % of half the max width or max height
			// divide half max width by numPointsPerCluster
			let widthIncrease = (width*0.5)/numPointsPerCluster
			let heightIncrease = (height*0.5)/numPointsPerCluster
			halfwidth += widthIncrease * (1 - CLUSTERING_FACTOR)
			halfheight += heightIncrease * (1 - CLUSTERING_FACTOR)
		}
	}

	// generate noise
	for (let i = 0; i < numNoisePoints; i++) {
		let x = randomBounded(0,width)
		let y = randomBounded(0,height)
		let p = createVector(x, y)
		let node = new Node(p, 0)
		nodes.push(node)
	}
}*/

function randomBounded(min,max) {
	return floor(random()*1000) % (max - min + 1) + min
}

function mapPoint(point, xmin,xmax, ymin,ymax) {
	let new_xmin = width*0.05
	let new_xmax = width*0.95
	let new_ymin = height*0.05
	let new_ymax = height*0.95
	let x = map(point.x, xmin, xmax, new_xmin, new_xmax)
	let y = map(point.x, ymin, ymax, new_ymin, new_ymax)
}


/*function startClustering(num) {
	clusterNodes = []

	
	for (let i = 0; i < num; i++) {
		let x = floor(random()*1000)%width
		let y = floor(random()*1000)%height
		let p = createVector(x, y)
		let node = new Node(p, i+1, true) // this is related to the j-1 below
		clusterNodes.push(node)
	}

	clustering = true

	if (num < 1) {
		removeClustering()
	}
}

function removeClustering() {
	clustering = false
	clusterNodes = []
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].nodeclass = 0
	}
}
*/
function setClass(nodeclass) {
	nodeManager.setClass(nodeclass)
}

function setK(k) {
	nodeManager.setK(k)
}

/*==================================================*/
// OPEN FILE

function handleFileSelect(event) {
	//console.log("handleFileSelect() ...")
	let file = event.target.files[0]
	if (file) {
		let reader = new FileReader()
		
		reader.readAsText(file)
		reader.onload = function(e) {
			processData(e.target.result)
		}
		reader.onerror = function(e) {
			alert("Cannot read file.")
		}
	} else {
		alert("Failed to load file.")
	}
}

function processData(csv) {
	console.log("Processing data...")
	let lines = csv.split(/\r\n|\n/)
	let array = []
	for (let i = 0; i < lines.length; i++) {
		let strings = lines[i].split(' ') // all numbers in a row
		let column = []
		for (let j = 0; j < strings.length; j++) {
			let number = parseInt(strings[j])
			if (!isNaN(number))
				column.push(number)
		}
		array.push(column)
	}
	console.log(array)

	arrayToNodes(array)
}

function arrayToNodes(array) {
	let _nodes = []

	// Find xmin, xmax, ymin, ymax
	let xmin = Infinity, ymin = Infinity
	let xmax = -Infinity, ymax = -Infinity
	for (let i = 0; i < array.length; i++) {
		if (array[i].length < 2) {
			continue
		}
		let x = array[i][0]
		let y = array[i][1]
		xmin = min(x, xmin)
		ymin = min(y, ymin)
		xmax = max(x, xmax)
		ymax = max(y, ymax)
	}

	// Generate nodes
	let xpadding = width*0.05
	let ypadding = height*0.05
	for (let i = 0; i < array.length; i++) {
		if (array[i].length < 2) {
			continue
		}
		let x = map(array[i][0], xmin, xmax, 0+xpadding, width-xpadding)
		let y = map(array[i][1], ymin, ymax, 0+ypadding, height-ypadding)
		let nodeclass = (array[i].length >= 3) ? array[i][2] : 0

		let p = createVector(x,y)
		let node = new Node(p, nodeclass)
		_nodes.push(node)
	}

	// TODO: RETURN NODES INSTEAD
	nodeManager.nodes = _nodes
}

function changeFramerate(fr) {
  FRAMERATE = parseInt(fr)
}

function clusterInput() {
  let slider = document.getElementById('clusters-slider');
  nodeManager.setClusters(slider.value)
  //nodeManager.initializeClusters(slider.value)
}

function updateClusterLabel() {
  let slider = document.getElementById('clusters-slider'); 
  document.getElementById('clusters-label').innerHTML = slider.value; 
}

function drawFramerateBar() {
  let fr = frameRate()
  fr = map(fr, 0,70, 0,width)
  push()
  strokeWeight(1)
  line(0,1, fr,1)
  pop()
}

function noiseInput() {
	let slider = document.getElementById('slider-noise')
	//let label = document.getElementById('label-noise')
	//label.innerHTML = round(slider.value * 100) + "%"
	nodeManager.setClusteringNoise(slider.value)
}

function clusteringFactorInput() {
	let slider = document.getElementById('slider-clustering-factor')
	let label = document.getElementById('label-clustering-factor')
	label.innerHTML = slider.value
	nodeManager.setClusteringFactor(slider.value)
}

function getColour(num) {
	let colour = null
	switch(num) {
		case 0: colour = 'white'; break;
		case 1: colour = 'red';break;
		case 2: colour = 'green'; break;
		case 3: colour = 'blue'; break;
		case 4: colour = 'yellow'; break;
		case 5: colour = 'darkblue'; break;
		case 6: colour = 'brown'; break;
		case 7: colour = 'orange'; break;
		case 8: colour = 'purple'; break;
		case 9: colour = 'lightblue'; break;
		case 10: colour = 'lightgreen'; break;
		case 11: colour = 'pink'; break;
		case 12: colour = color(255, 90, 0); break;
		case 13: colour = color(204, 102, 153); break;
		case 14: colour = color(102, 102, 153); break;
		default: colour = 'black'; break;
	}
	return colour
}