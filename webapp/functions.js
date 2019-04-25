function mousePressed() {
	if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
		return
	}
	let p = createVector(mouseX, mouseY)
	let node = new Node(p, currentClass)
	nodes.push(node)

	
}

function generatePoints(num,xrange,yrange) {
	nodes = []
	let xmax = floor(width*xrange)
	let ymax = floor(height*yrange)
	for (let i = 0; i < num; i++) {
		let x = floor(random()*1000)%xmax
		let y = floor(random()*1000)%ymax

		let p = createVector(x, y)
		let node = new Node(p, 0)
		//console.log(node)
		nodes.push(node)
	}
}

function startClustering(num) {
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

function setClass(i) {
	currentClass = i
}

function setK(kval) {
	//if (kval > nodes.length) kval = nodes.length
	knn = kval
}

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
	nodes = []

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
		nodes.push(node)
	}
}

// SAVE FILE

function nodesToArray() {
	console.log("convertNodesToArray()...")
	let array = []
	for (let node of nodes) {
		let row = []
		row.push(node.position.x)
		row.push(node.position.y)
		row.push(node.nodeclass)
		array.push(row)
	}
	return array
}

function arrayToString(array) {
	let string = ''
	array.forEach(function(value) {
		string += value.join(' ') + '\n'
	})
	return string
}

function saveArrayAsTextFile(array) {
	console.log("saveArrayAsTextFile()...")
	let fs = require('fs')
	let file = fs.createWriteStream('sample.txt')
	file.on('error', function(error) { alert("Cannot create file.")})
	array.forEach(function(value) {
		file.write(value.join(' ') + '\n')
	})
	file.end()
	console.log("saved file successfully!")
}

function changeFramerate(fr) {
	FRAMERATE = parseInt(fr)
}

function clusterInput() {
	let slider = document.getElementById('clusters-slider'); 
	//document.getElementById('clusters-label').innerHTML = slider.value; 
	console.log("clusters " + slider.value)
	startClustering(slider.value);
}

function updateClusterLabel() {
	let slider = document.getElementById('clusters-slider'); 
	document.getElementById('clusters-label').innerHTML = slider.value; 
}