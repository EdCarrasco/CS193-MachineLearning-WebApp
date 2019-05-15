let matrix = []
let smallest_i = 0
let smallest_j = 0
let smallestDistance = Infinity
let clusterGraph = null

function setup() {
	let canvas = createCanvas(640,480)
	canvas.parent('canvas-container')

	nodeManager = new NodeManager(25)
	clusterGraph = new ClusterGraph(width*0.55,height*0.05, nodeManager)

}

class NodeGroup {
	constructor() {
		this.nodes = []
		this.position = createVector(0,0)
		this.nodeclass = 0
		this.colour = color(0,0)
	}

	add(node) {
		this.nodes.push(node)
		this.nodeclass = node.nodeclass
		this.colour = getColour(this.nodeclass)
		for (let node of this.nodes) {
			node.setClass(this.nodeclass)
		}
	}

	update() {
		if (this.nodes.length < 1) {
			this.position = createVector(0,0)
			return
		}
		let xmean = 0
		let ymean = 0
		for (let node of this.nodes) {
			xmean += node.position.x
			ymean += node.position.y
		}
		xmean /= this.nodes.length
		ymean /= this.nodes.length
		this.position = createVector(xmean,ymean)
	}

	draw() {
		push()
		fill(this.colour)
		stroke(this.colour)
		ellipse(this.position.x, this.position.y, 10)
		strokeWeight(5)
		for (let node of this.nodes) {
			line(this.position.x, this.position.y, node.position.x, node.position.y)
		}
		pop()

		push()
		stroke('black')
		fill(0,0)
		ellipse(this.position.x, this.position.y, 10)
		pop()
	}
}

class GraphLine {
	constructor(left,right) {
		this.left = left
		this.right = right

		let x = (this.left.position.x + this.right.position.x)/2
		let y = this.left.position.y
		this.middle = createVector(x,y)
		this.height = dist(left.position.x, left.position.y, right.position.x, right.position.y)
	}

	draw() {
		push()
		ellipse(this.left.position.x, this.left.position.y+this.height, 15)
		ellipse(this.right.position.x, this.right.position.y+this.height, 15)
		fill('green')
		ellipse(this.middle.x, this.middle.y+this.height, 15)
		pop()
	}
}

class ClusterGraph {
	constructor(x,y, nodeManager) {
		this.pos = createVector(x,y)
		this.distanceMatrix = []
		this.nM = nodeManager

		this.nodeGroups = []

		this.smallestDistance = Infinity
		this.smallest_i = 0
		this.smallest_j = 0

		this.graphLines = []
	}

	initialize() {
		this.nodeGroups = []
		for (let node of this.nM.nodes) {
			let nodeGroup = new NodeGroup()
			nodeGroup.add(node)
			this.nodeGroups.push(nodeGroup)
		}
	}

	generateDistanceMatrix() {
		this.distanceMatrix = []
		for (let i = 0; i < this.nodeGroups.length; i++) {
			let row = []
			for (let j = 0; j < this.nodeGroups.length; j++) {
				let p1 = this.nodeGroups[i].position
				let p2 = this.nodeGroups[j].position
				let distance = dist(p1.x, p1.y, p2.x, p2.y)
				row.push(distance)
			}
			this.distanceMatrix.push(row)
		}
	}

	searchDistanceMatrix() {
		if (this.nodeGroups.length < 1) {
			return
		}
		this.smallestDistance = Infinity
		this.smallest_i = 0
		this.smallest_j = 0
		for (let i = 1; i < this.distanceMatrix.length; i++) {
			for (let j = 0; j < i; j++) {
				let distance = this.distanceMatrix[i][j]
				if (distance < this.smallestDistance) {
					this.smallestDistance = distance
					this.smallest_i = i
					this.smallest_j = j
				}
			}
		}
	}

	combineClosestNodeGroups() {
		if (this.nodeGroups.length <= 1) {
			console.log("Cant combine anymore.")
			return
		}
		let g1 = this.nodeGroups[this.smallest_i]
		let g2 = this.nodeGroups[this.smallest_j]
		this.combineNodeGroups(g1,g2)


		// CREATE GRAPH LINE
		let line = new GraphLine(g1,g2)
		this.graphLines.push(line)
	}

	combineNodeGroups(g1,g2) {
		let combinedGroup = new NodeGroup()
		for (let node of g1.nodes) {
			combinedGroup.add(node)
		}
		for (let node of g2.nodes) {
			combinedGroup.add(node)
		}
		this.nodeGroups.push(combinedGroup)

		// Remove g1 and g2
		let i = this.nodeGroups.indexOf(g1)
		let j = this.nodeGroups.indexOf(g2)
		this.nodeGroups.splice(i,1)
		this.nodeGroups.splice(j,1)
	}

	update() {
		for (let nodeGroup of this.nodeGroups) {
			nodeGroup.update()
		}
	}

	draw() {
		for (let nodeGroup of this.nodeGroups) {
			nodeGroup.draw()
		}
		for (let line of this.graphLines) {
			//line.draw()
		}
	}
}

function CombineNext() {
	clusterGraph.generateDistanceMatrix()
	clusterGraph.searchDistanceMatrix()
	clusterGraph.combineClosestNodeGroups()
}

function draw() {
	background(51)
	
	push()
	fill(200)
	rect(width*0.55,height*0.05,width*0.40,height*0.90)//rect(width*0.5,height*0.9, width*0.5, height*1)
	pop()

	if (clusterGraph.nM.nodes.length < 1)
		return

	clusterGraph.update()
	clusterGraph.draw()

	nodeManager.update()
	nodeManager.draw()

	push()
	let line_i = 0
	let line_j = 0
	let nodey = height*0.1-0
	for (let i = 0; i < nodeManager.nodes.length; i++) {
		let x = width*0.55+(23*(i+1))
		

		if (i == smallest_i) {
			fill('red')
			ellipse(x,nodey, 25)
			line_i = x
		} else if (i == smallest_j) {
			fill('blue')
			ellipse(x,nodey, 25)
			line_j = x
		}

		fill('white')
		ellipse(x, nodey, 15)
		fill('black')
		textAlign(CENTER,CENTER)
		text(i+1, x, nodey)
	}
	pop()
	push()
	let liney = nodey + 25/2 + smallestDistance
	line(line_i,liney, line_j,liney)
	line(line_i,liney, line_i,nodey+25/2)
	line(line_j,liney, line_j,nodey+25/2)
	let avgx = (line_i+line_j)/2
	textAlign(CENTER,CENTER)
	text(smallestDistance, avgx, liney+10)
	pop()

	if (mouseIsPressed) {
		let offset = nodeManager.node_radius/2
		for (let i = 0; i < nodeManager.nodes.length; i++) {
			let x = nodeManager.nodes[i].position.x
			let y = nodeManager.nodes[i].position.y
			if (x >= mouseX-offset && x <= mouseX+offset &&
				y >= mouseY-offset && y <= mouseY+offset) {
				nodeManager.nodes[i].position = createVector(mouseX,mouseY)
				break
			}
		}
	}
}