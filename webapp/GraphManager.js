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
		//for (let node of this.nodes) {
		//	node.setClass(this.nodeclass)
		//}
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

/*class GraphLine {
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
}*/

class GraphLine {
	constructor(p1,p2,height) {
		this.left = p1
		this.right = p2
		this.height = height
	}

	getCenterPoint() {
		let xmean = (this.left.pos.x+this.right.pos.x)/2
		return createVector(xmean,this.height)
	}

	draw() {
		//let i = nodeManager.nodes.indexOf(this.left)
		//let j = nodeManager.nodes.indexOf(this.right)

		let xmin = this.left.pos.x//clusterGraph.dots[i].pos.x
		let xmax = this.right.pos.x//clusterGraph.dots[j].pos.x
		let ymin = this.left.pos.y//clusterGraph.dots[i].pos.y
		let ymax = this.height
		push()
		
		stroke('black')
		line(xmin,this.height, xmax,this.height) // horizontal line
		line(xmin,this.height, xmin,ymin)
		line(xmax,this.height, xmax,ymin)
		pop()
		push()
		translate(this.getCenterPoint())
		textAlign(CENTER,CENTER)
		text(round(this.height), 0,10)
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
		this.dots = []
	}

	initialize() {
		this.nodeGroups = []
		for (let node of this.nM.nodes) {
			let nodeGroup = new NodeGroup()
			nodeGroup.add(node)
			this.nodeGroups.push(nodeGroup)
		}
		this.initializeDots()
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

		// REARRANGE DOTS
		let i = this.nM.nodes.indexOf(g1.nodes[0])
		let j = this.nM.nodes.indexOf(g2.nodes[0])
		let d = j - i
		/*if (d >= 1) {
			let temp = this.dots[i+1]
			this.dots[i+1] = this.dots[j]
			this.dots[j] = temp

			let height = this.dots[i].pos.y + this.distanceMatrix[i][i+1]
			let line = new GraphLine(this.dots[i], this.dots[i+1], height)
			this.graphLines.push(line)
		} else if (d <= -1) {
			let temp = this.dots[i-1]
			this.dots[i-1] = this.dots[j]
			this.dots[j] = temp

			console.log("i = " + i + "  j = " + j)
			let height = this.distanceMatrix[i][i-1]
			let line = new GraphLine(this.dots[i], this.dots[i-1], height)
			this.graphLines.push(line)
		}*/
		let temp = this.dots[i]
		this.dots[i] = this.dots[j]
		this.dots[j] = temp

		// CREATE GRAPH LINE
		
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
			line.draw()
		}
		this.drawNodes()
		this.drawMatrix()
	}

	initializeDots() {
		console.log("init dots")
		this.dots = []
		let graphWidth = width-this.pos.x
		let cellWidth = graphWidth/this.nM.nodes.length
		let r = 10
		let x = this.pos.x + cellWidth/2
		let y = this.pos.y + r + 5
		for (let node of this.nM.nodes) {
			let n = node.nodeclass
			this.dots.push({pos:createVector(x,y), colour:node.colour, label:node.label, radius:r})
			x += cellWidth
		}
	}

	drawNodes() {
		for (let i = 0; i < this.dots.length; i++) {
			push()
			translate(this.dots[i].pos)
			fill(this.dots[i].colour)
			ellipse(0,0, this.dots[i].radius*2)
			fill('black')
			textAlign(CENTER,CENTER)
			text(this.dots[i].label, 0,0)
			pop()
		}
	}

	drawMatrix() {
		let xoffset = 20
		let yoffset = 335
		let xcell = 40
		let ycell = 15
		let dotRadius = 10
		this.generateDistanceMatrix()
		for (let row = 0; row < this.distanceMatrix.length; row++) {
			for (let col = 0; col < this.distanceMatrix[row].length; col++) {
				let cell = this.distanceMatrix[row][col]
				let x = this.pos.x + xcell*col + xoffset
				let y = this.pos.y + ycell*row + yoffset
				textAlign(LEFT,CENTER)
				text(round(cell), x,y)
			}
		}
		push()
		for (let i = 0; i < this.nodeGroups.length; i++) {
			// Draw vertical dots
			let x = this.pos.x + xoffset - dotRadius
			let y = this.pos.y + ycell*i + yoffset
			noStroke()
			fill(this.nodeGroups[i].colour)
			ellipse(x,y, dotRadius)
			// Draw horizontal dots
			x = this.pos.x + xcell*i + xoffset + dotRadius
			y = this.pos.y + yoffset + ycell*this.nodeGroups.length - 3
			ellipse(x,y,dotRadius)
		}
		pop()
	}
}