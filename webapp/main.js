
function setup() {
	let canvas = createCanvas(640, 380)
	//let canvas2 = createCanvas(100,100)
	canvas.parent('canvas-container')
	//canvas2.parent('canvas2')

	/*tests = []
	tests.push(new Test(5))
	tests.push(new Test(3))
	tests.push(new Test(2))
	tests.push(new Test(6))
	tests.sort((a,b) => (a.num > b.num) ? 1 : -1)*/

	document.getElementById('file-open').addEventListener('change', handleFileSelect, false)
}



/*function generatePoints(num,xrange,yrange) {
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
}*/

function draw() {
	background(200)
	frameRate(FRAMERATE)
	

	for (let i = 0; i < nodes.length; i++) {
		nodes[i].update()
		nodes[i].draw()
	}

	for (let i = 0; i < clusterNodes.length; i++) {
		clusterNodes[i].update()
	}

	let mousePos = createVector(mouseX,mouseY)
	nodes.sort((a,b) => (a.distanceTo(mousePos) > b.distanceTo(mousePos)) ? 1 : -1)
	let max = min(nodes.length, knn) // k nearest neighbors
	let winnerClass = 0
	for (let i = 0; i < max; i++) {
		push()
		stroke(nodes[i].color)
		strokeWeight(1)
		line(mouseX, mouseY, nodes[i].position.x, nodes[i].position.y)
		pop()
	}

	for (let i = 0; i < clusterNodes.length; i++) {
		clusterNodes[i].draw()
	}

	/*if (clusterNodes.length < 1) {
		for (let node of nodes) {
			node.nodeclass = 0 // TODO: CHANGE BACK TO ORIGINAL CLASS
		}
		return
	}*/

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

	text("framerate: "+floor(getFrameRate()), 1,11)
}

