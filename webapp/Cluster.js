let nodeManager
let treeManager
let clusterManager

let SINGLE_LINKAGE = 0
let COMPLETE_LINKAGE = 1
let AVERAGE_LINKAGE = 2

/*
1. Generate distance matrix between all pairs of clusters
	a. Distance between clusters can be defined as:
		- Single linkage
		- Complete linkage
		- Average linkage
2. Find the pair of clusters with smallest distance
3. Merge the pair of clusters into a single cluster
4. Repeat steps 1 - 3 until there is only one cluster
*/

function buttonRandomize() {
	let topLeftBoundary = createVector(10,10)
	let bottomRightBoundary = createVector(width*0.4,height-10)

	nodeManager.initialize()
	nodeManager.createMultipleNodes(10, topLeftBoundary, bottomRightBoundary)
	clusterManager.populateMatrices()
}

function buttonNext() {
	clusterManager.combineClosestClusters()
	clusterManager.populateMatrices()
}



function buttonRestart() {
	clusterManager.initialize()
	treeManager.initialize()
}

function buttonSingleLinkage() {
	clusterManager.setType(SINGLE_LINKAGE)
	clusterManager.initialize()
	treeManager.initialize()
}

function buttonCompleteLinkage() {
	clusterManager.setType(COMPLETE_LINKAGE)
	clusterManager.initialize()
	treeManager.initialize()
}

function buttonAverageLinkage() {
	clusterManager.setType(AVERAGE_LINKAGE)
	clusterManager.initialize()
	treeManager.initialize()
}

/*==========================================================*/

function setup() {
	let canvas = createCanvas(1200, 400)
	canvas.parent('canvas-container')
	
	clusterManager = new ClusterManager(createVector(860,50))
	treeManager = new TreeManager(createVector(550,20))
	nodeManager = new NodeManager()

	linkManagers(nodeManager, clusterManager, treeManager)

	/*nodeManager.createNode(createVector(150,height-90), 1)
	nodeManager.createNode(createVector(80,height-180), 2)
	nodeManager.createNode(createVector(60,height-260), 3)*/

	/*nodeManager.createNode(createVector(100,height-100), 0)
	nodeManager.createNode(createVector(150,height-90), 1)
	nodeManager.createNode(createVector(80,height-180), 2)
	nodeManager.createNode(createVector(60,height-260), 3)
	nodeManager.createNode(createVector(150,height-240), 4)
	nodeManager.createNode(createVector(200,height-300), 5)
	nodeManager.createNode(createVector(250,height-290), 6)*/

	let topLeft = createVector(10,10)
	let bottomRight = createVector(width*0.4,height-10)
	nodeManager.createMultipleNodes(10, topLeft, bottomRight)
	clusterManager.populateMatrices()
}

function draw() {
	background(51)

	treeManager.draw()
	//clusterManager.draw()
	nodeManager.draw()

	push()
	fill('white')
	text(clusterManager.clustersSL.length, 100,100)
	text(clusterManager.clustersCL.length, 100,120)
	text(clusterManager.clustersAL.length, 100,140)
	pop()
}

/*========================================*/

function linkManagers(nm, cm, tm) {
	nm.linkClusterManager(cm)
	nm.linkTreeManager(tm)
	cm.linkNodeManager(nm)
	cm.linkTreeManager(tm)
	tm.linkNodeManager(nm)
	tm.linkClusterManager(cm)
}

function randomBounded(min,max) {
	return floor(random()*1000) % (max - min + 1) + min
}

function getColour(num) {
	let colour = null
	switch(num%14+1) {
		case 0: colour = 'white'; break;
		case 1: colour = 'red';break;
		case 2: colour = 'green'; break;
		case 3: colour = 'blue'; break;
		case 4: colour = 'yellow'; break;
		case 5: colour = 'lightgreen'; break;
		case 6: colour = 'orange'; break;
		case 7: colour = 'brown'; break;
		case 8: colour = 'purple'; break;
		case 9: colour = 'lightblue'; break;
		case 10: colour = 'darkblue'; break;
		case 11: colour = 'pink'; break;
		case 12: colour = color(255, 90, 0); break;
		case 13: colour = color(204, 102, 153); break;
		case 14: colour = color(102, 102, 153); break;
		default: colour = 'white'; break;
	}
	return colour
}

function dashedCircle(radius, dashWidth, dashSpacing) {
    let steps = 200;
    let dashPeriod = dashWidth + dashSpacing;
    let lastDashed = false;
    for(let i = 0; i < steps; i++) {
      let curDashed = (i % dashPeriod) < dashWidth;
      if(curDashed && !lastDashed) {
        beginShape();
      }
      if(!curDashed && lastDashed) {
        endShape();
      }
      if(curDashed) {
        let theta = map(i, 0, steps, 0, TWO_PI);
        vertex(cos(theta) * radius/2, sin(theta) * radius/2);
      }
      lastDashed = curDashed;
    }
    if(lastDashed) {
      endShape();
    }
}

/*=========================================*/

class Node {
	constructor(position, label) {
		this.position = position
		this.label = label
		this.radius = 10
	}

	distanceTo(position) {
		return p5.Vector.sub(this.position, position).mag()
	}

	draw() {
		push()
		translate(this.position)
		fill(getColour(this.label))
		noStroke()
		ellipse(0,0, this.radius*2)
		textAlign(CENTER,CENTER)
		fill('black')
		text(this.label, 0,0)
		pop()
	}
}

class NodeManager {
	constructor() {
		this.nodes = []
		this.clusterManager = null
		this.treeManager = null
	}

	initialize() {
		this.nodes = []
	}

	linkTreeManager(tm) {this.treeManager = tm}
	linkClusterManager(cm) {this.clusterManager = cm}

	createNode(position, label) {
		let node = new Node(position, label)
		this.nodes.push(node)
		this.clusterManager.initialize()
		this.treeManager.initialize()
	}

	createMultipleNodes(amount, topLeft, bottomRight) {
		for (let i = 0; i < amount; i++) {
			let x = randomBounded(topLeft.x, bottomRight.x)
			let y = randomBounded(topLeft.y, bottomRight.y)
	
			let pos = createVector(x,y)
			this.createNode(pos, i)	
		}
	}

	distance(i,j) {
		let node1 = this.nodes[i]
		let node2 = this.nodes[j]
		let vector = p5.Vector.sub(node1.position, node2.position)
		return vector.mag()
	}

	indexOf(node) {
		return this.nodes.indexOf(node)
	}

	draw() {
		for (let node of this.nodes) {
			node.draw()
		}
	}
}

/*==========================================*/

class Cluster {
	constructor(node) {
		this.nodes = []
		//this.label = ""
		this.label = -1
		this.position = null
		this.clusterRadius = null
		this.addNode(node)
		this.showPrev = false
	}

	addNode(node) {
		console.log("addNode :: array size: " + this.nodes.length)
		let index = this.nodes.indexOf(node)
		if (index == -1) {
			this.nodes.push(node)
			this.update()
			this.label = node.label
		}
		else {
			console.log("ERROR Cluster::addNode(" + index + ") already exists")
		}
	}

	update() {
		let greatestDistance = 0
		let position = createVector(0,0)
		if (this.nodes.length < 2) {
			position = this.nodes[0].position
		} else {
			for (let node of this.nodes) {
				position.add(node.position)
			}
			position.div(this.nodes.length)
			
			for (let node of this.nodes) {
				let distance = dist(position.x, position.y, node.position.x, node.position.y)
				if (distance > greatestDistance) {
					greatestDistance = distance
				}
			}
		}
		this.position = position
		this.clusterRadius = greatestDistance + this.nodes[0].radius*2
	}

	draw() {
		if (!this.showPrev) {
			push()
			translate(this.position)
			stroke(getColour(this.label))
			strokeWeight(2)
			noFill()
			ellipse(0,0, this.clusterRadius*2)
			pop()
		}
	}

	drawTiny(offset, xdir, ydir, rotated) {
		let n = this.nodes.length
		push()
		translate(offset)
		for (let i = 0; i < n; i++) {
			let x = xdir * floor(i / 3) * 6
			let y = ydir * (i % 3) * 6
			fill(getColour(this.nodes[i].label))
			noStroke()
			if (rotated)
				ellipse(y,x, 5)
			else
				ellipse(x,y, 5)
		}
		pop()
	}
}

class ClusterManager {
	constructor(position) {
		this.position = position
		this.clustersSL = []
		this.clustersCL = []
		this.clustersAL = []

		this.nodeManager = null
		this.treeManager = null

		this.positionA_SL = null
		this.positionA_CL = null
		this.positionA_AL = null
		this.positionB_SL = null
		this.positionB_CL = null
		this.positionB_AL = null

		this.radiusA_SL = -1
		this.radiusA_CL = -1
		this.radiusA_AL = -1
		this.radiusB_SL = -1
		this.radiusB_CL = -1
		this.radiusB_AL = -1

		this.lastHeightSL = -1
		this.lastHeightCL = -1
		this.lastHeightAL = -1

		this.lastResultSL = []
		this.lastResultCL = []
		this.lastResultAL = []

		this.matrixSL = []
		this.matrixCL = []
		this.matrixAL = []
		this.closestPairSL = []
		this.closestPairCL = []
		this.closestPairAL = []
		this.smallestDistanceSL = -1
		this.smallestDistanceCL = -1
		this.smallestDistanceAL = -1

		this.type = AVERAGE_LINKAGE
		this.viewType = AVERAGE_LINKAGE
	}

	linkNodeManager(nm) {this.nodeManager = nm}
	linkTreeManager(tm) {this.treeManager = tm}

	initialize() {
		this.clustersSL = []
		this.clustersCL = []
		this.clustersAL = []
		for (let node of this.nodeManager.nodes) {
			let clusterSL = new Cluster(node)
			let clusterCL = new Cluster(node)
			let clusterAL = new Cluster(node)
			this.clustersSL.push(clusterSL)
			this.clustersCL.push(clusterCL)
			this.clustersAL.push(clusterAL)
		}
		this.clear()
		this.populateMatrices()
	}

	setType(type) {
		this.type = type
		this.viewType = type
	}

	clear() {
		this.positionA_SL = null
		this.positionA_CL = null
		this.positionA_AL = null
		this.positionB_SL = null
		this.positionB_CL = null
		this.positionB_AL = null

		this.radiusA_SL = -1
		this.radiusA_CL = -1
		this.radiusA_AL = -1
		this.radiusB_SL = -1
		this.radiusB_CL = -1
		this.radiusB_AL = -1

		this.lastHeightSL = -1
		this.lastHeightCL = -1
		this.lastHeightAL = -1

		this.lastResultSL = []
		this.lastResultCL = []
		this.lastResultAL = []
	}

	mergeClusters(array, clusterA, clusterB) {
		//console.log("mergeClusters :: (" + clusterA.label + ") and (" + clusterB.label + ")")
		let str = "mergeClusters ("
		for (let node of clusterA.nodes) {
			str += node.label + ","
		}
		str += ") and ("
		for (let node of clusterB.nodes) {
			str += node.label + ","
			clusterA.addNode(node)
		}
		str += ")"
		console.log(str)
		let index = array.indexOf(clusterB)
		array.splice(index, 1)
		//console.log("removed " + index + " length: " + this.clusters.length)
	}

	distanceSingleLinkage(k,l) {
		if (k == l) {
			return -1//[null,null,-1]
		}
		let smallestDistance = Infinity
		let positionA = null
		let positionB = null
		for (let i = 0; i < this.clustersSL[k].nodes.length; i++) {
			for (let j = 0; j < this.clustersSL[l].nodes.length; j++) {
				let distance = dist(this.clustersSL[k].nodes[i].position.x, 
														this.clustersSL[k].nodes[i].position.y, 
														this.clustersSL[l].nodes[j].position.x, 
														this.clustersSL[l].nodes[j].position.y)
				if (distance < smallestDistance) {
					smallestDistance = distance
					positionA = this.clustersSL[k].nodes[i].position.copy()
					positionB = this.clustersSL[l].nodes[j].position.copy()
				}
			}
		}
		return smallestDistance//[positionA, positionB, smallestDistance]
	}

	distanceCompleteLinkage(k,l) {
		if (k == l) {
			return -1//[null,null,-1]
		}
		let greatestDistance = -Infinity
		let positionA = null
		let positionB = null
		for (let i = 0; i < this.clustersCL[k].nodes.length; i++) {
			for (let j = 0; j < this.clustersCL[l].nodes.length; j++) {
				let distance = dist(this.clustersCL[k].nodes[i].position.x, 
														this.clustersCL[k].nodes[i].position.y, 
														this.clustersCL[l].nodes[j].position.x, 
														this.clustersCL[l].nodes[j].position.y)
				if (distance > greatestDistance) {
					greatestDistance = distance
					positionA = this.clustersCL[k].nodes[i].position.copy()
					positionB = this.clustersCL[l].nodes[j].position.copy()
				}
			}
		}
		return greatestDistance//[positionA, positionB, greatestDistance]
	}

	distanceAverageLinkage(k,l) {
		if (k == l) {
			return -1//[null,null,-1]
		}
		let averageDistance = 0
		for (let i = 0; i < this.clustersAL[k].nodes.length; i++) {
			for (let j = 0; j < this.clustersAL[l].nodes.length; j++) {
				averageDistance += dist(this.clustersAL[k].nodes[i].position.x, 
																this.clustersAL[k].nodes[i].position.y, 
																this.clustersAL[l].nodes[j].position.x, 
																this.clustersAL[l].nodes[j].position.y)
			}
		}
		averageDistance /= this.clustersAL[k].nodes.length * this.clustersAL[l].nodes.length
		return averageDistance//[this.clustersAL[k].position.copy(), this.clustersAL[l].position.copy(), averageDistance]
	}

	populateMatrices() {
		this.matrixSL = []
		this.matrixCL = []
		this.matrixAL = []

		let rcdSL = [null,null,-1]
		let rcdCL = [null,null,-1]
		let rcdAL = [null,null,-1]

		let smallestDistanceSL = Infinity
		let smallestDistanceCL = Infinity
		let smallestDistanceAL = Infinity
		for (let r = 0; r < this.clustersSL.length; r++) {
			let rowSL = []
			let rowCL = []
			let rowAL = []
			for (let c = 0; c < this.clustersSL.length; c++) {
				let distanceSL = this.distanceSingleLinkage(r,c)
				let distanceCL = this.distanceCompleteLinkage(r,c)
				let distanceAL = this.distanceAverageLinkage(r,c)
				rowSL.push(distanceSL)
				rowCL.push(distanceCL)
				rowAL.push(distanceAL)
				if (distanceSL < smallestDistanceSL && distanceSL >= 0) {
					//this.closestPairSL = [r,c]
					smallestDistanceSL = distanceSL
					rcdSL = [this.clustersSL[r], this.clustersSL[c], distanceSL]
				}
				if (distanceCL < smallestDistanceCL && distanceCL >= 0) {
					//this.closestPairCL = [r,c]
					smallestDistanceCL = distanceCL
					rcdCL = [this.clustersCL[r], this.clustersCL[c], distanceCL]
				}
				if (distanceAL < smallestDistanceAL && distanceAL >= 0) {
					//this.closestPairAL = [r,c]
					smallestDistanceAL = distanceAL
					rcdAL = [this.clustersAL[r], this.clustersAL[c], distanceAL]
				}
			}
			this.matrixSL.push(rowSL)
			this.matrixCL.push(rowCL)
			this.matrixAL.push(rowAL)
		}
		return [rcdSL, rcdCL, rcdAL]
	}

	combineClosestClusters() {
		let data = this.populateMatrices()
		let dataSL = data[0]
		let dataCL = data[1]
		let dataAL = data[2]
		
		let clusterA_SL = dataSL[0]
		let clusterB_SL = dataSL[1]
		let distanceSL  = dataSL[2]

		let clusterA_CL = dataCL[0]
		let clusterB_CL = dataCL[1]
		let distanceCL  = dataCL[2]

		let clusterA_AL = dataAL[0]
		let clusterB_AL = dataAL[1]
		let distanceAL  = dataAL[2]

		if (clusterA_SL && clusterB_SL) {
			this.mergeClusters(this.clustersSL, clusterA_SL, clusterB_SL)
			this.treeManager.addBranch(clusterA_SL.nodes[0], clusterB_SL.nodes[0], distanceSL)
		}
		if (clusterA_CL && clusterB_CL) {
			this.mergeClusters(this.clustersCL, clusterA_CL, clusterB_CL)
			//this.treeManager.addBranch(clusterA_CL.nodes[0], clusterB_CL.nodes[0], distanceCL)
		}
		if (clusterA_AL && clusterB_AL) {
			this.mergeClusters(this.clustersAL, clusterA_AL, clusterB_AL)
			//this.treeManager.addBranch(clusterA_AL.nodes[0], clusterB_AL.nodes[0], distanceAL)
		}
	}

	findClosestClusters() {
		//console.log("findClosestClusters()...")
		let smallestDistanceClusters = Infinity
		let clusterA = null
		let clusterB = null
		let result = [] // (nodeA, nodeB, distance)
		for (let k = 0; k < this.clustersSL.length-1; k++) {
			this.clustersSL[k].showPrev = false
			for (let l = k+1; l < this.clustersSL.length; l++) {
				this.clustersSL[l].showPrev = false
				result = this.distanceFunction(k,l)
				if (result[2] < smallestDistanceClusters) {
					smallestDistanceClusters = result[2]
					clusterA = this.clustersSL[k]
					clusterB = this.clustersSL[l]
				}
			}
		}
		this.lastResult = result

		if (clusterA && clusterB) {
			this.posA = clusterA.position.copy()
			this.radiusA = clusterA.clusterRadius
			this.posB = clusterB.position.copy()
			this.radiusB = clusterB.clusterRadius
			this.lastHeight = smallestDistanceClusters
		} else {
			this.posA = null
			this.radiusA = -1
			this.posB = null
			this.radiusB = -1
			this.lastHeight = -1
		}
		//console.log("smallestDistanceClusters: (" + this.nodeManager.indexOf(this.lastResult[0]) + " --- " + this.nodeManager.indexOf(this.lastResult[1]) + ") " + smallestDistanceClusters)
		return [clusterA, clusterB, smallestDistanceClusters]
	}



	indexOf(cluster) {
		return this.nodeManager.indexOf(cluster.nodes[0])
	}

	draw() {
		for (let cluster of this.clustersSL) {
			cluster.draw()
		}
		/*if (this.posA && this.posB) {
			push()
			strokeWeight(1)
			stroke('grey')
			noFill()
			ellipse(this.posA.x, this.posA.y, this.radiusA*2)
			ellipse(this.posB.x, this.posB.y, this.radiusB*2)

			pop()
		}*/
		if (this.posA) {
			push()
			translate(this.posA)
			stroke('white')
			dashedCircle(this.radiusA*2, 6, 2)
			noStroke()
			fill(255,5)
			ellipse(0,0, this.radiusA*2)
			pop()
		//}
		//if (this.posB) {
			push()
			translate(this.posB)
			stroke('white')
			dashedCircle(this.radiusB*2, 6, 2)
			noStroke()
			fill(255,5)
			ellipse(0,0, this.radiusB*2)
			pop()
		//}
		//if (this.lastResult.length > 0) {
			push()
			console.log(this.lastResult)
			let posA = /*(this.type == AVERAGE_LINKAGE) ? this.lastResult[0] : */this.lastResult[0].position
			let posB = /*(this.type == AVERAGE_LINKAGE) ? this.lastResult[1] : */this.lastResult[1].position
			console.log(this.type == 2 ? "average linkage" : "other linkage")
			let vector = p5.Vector.sub(posB, posA)
			
			console.log(vector)
			translate(posA)
			stroke('white')
			line(0,0, vector.x, vector.y)
			pop()

			push()
			//translate(posA)
			let center = p5.Vector.add(posA, vector.copy().mult(0.5))
			stroke('green')
			//line(posA.x,posA.y, center.x,center.y)
			pop()

			push()
			translate(center)
			let normal = createVector(center.y,center.x).normalize().mult(5)
			fill('white')
			text(round(this.lastResult[2]), normal.x, normal.y)
			pop()
		}
		console.log(this.viewType)
		switch (this.viewType) {
			case SINGLE_LINKAGE:
				this.drawMatrix(this.matrixSL, this.closestPairSL)
				break
			case COMPLETE_LINKAGE:
				this.drawMatrix(this.matrixCL, this.closestPairCL)
				break
			case AVERAGE_LINKAGE:
					this.drawMatrix(this.matrixAL, this.closestPairAL)
					break
		}
	}

	drawMatrix(matrix, smallestPair) {
		push()
		translate(this.position)
		textAlign(LEFT,CENTER)
		let xcell = 32
		let ycell = 24
		for (let r = 0; r < matrix.length; r++) {
			this.clustersSL[r].drawTiny(createVector(-20, r*ycell), -1, 1)
			this.clustersSL[r].drawTiny(createVector(r*xcell, -20), -1, 1, true)
			for (let c = 0; c < matrix.length; c++) {
				if (r == smallestPair[0] && c == smallestPair[1])
					fill('orange')
				else
					fill('black')
				text(round(matrix[r][c]), c*xcell, r*ycell)
			}
		}
		pop()
	}
}

/*==========================================*/

class Tree {
	constructor(node, label, left, right, height) {
		this.position = createVector(0,0)
		this.label = label
		this.left = left
		this.right = right
		this.parent = null
		this.height = height
		this.node = node
	}

	getRightmostLeaf() {
		let leaf = this
		while (leaf.right) leaf = leaf.right
		return leaf
	}

	getLeftmostLeaf() {
		let leaf = this
		while (leaf.left) leaf = leaf.left
		return leaf
	}
}

class TreeManager {
	constructor(position) {
		this.position = position
		this.trees = []
		this.nodeManager = null
		this.clusterManager = null
		this.radius = 10
	}

	linkNodeManager(nm) {this.nodeManager = nm}
	linkClusterManager(cm) {this.clusterManager = cm}

	initialize() {
		this.trees = []
		let x = 0
		for (let node of this.nodeManager.nodes) {
			let position = createVector(this.position.x+x, this.position.y)
			let tree = new Tree(node, node.label, null, null, 0)
			this.trees.push(tree)
			x += 20
		}
	}

	connect(clusterA, clusterB, height) {
		let i = this.nodeManager.indexOf(clusterA.nodes[0])
		let j = this.nodeManager.indexOf(clusterB.nodes[0])
		this.addBranch(i,j, height)
	}

	indexOf(node) {
		for (let i = 0; i < this.trees.length; i++) {
			if (node == this.trees[i].node) {
				return i
			}
		}
		return -1
	}

	addBranch(nodeA, nodeB, height) {
		if (nodeA == nodeB) {
			console.log("addBranch -- failed: same node")
			return false // cant combine same leaf
		}
		let i = this.indexOf(nodeA)
		let j = this.indexOf(nodeB)
		if (i > j) {[i,j]=[j,i]}
		
		let leftTree = this.getTopParent(i)
		let rightTree = this.getTopParent(j)

		

		let ll = this.trees.indexOf(leftTree.getLeftmostLeaf())
		let lr = this.trees.indexOf(leftTree.getRightmostLeaf())
		if (lr >= j) return false // leaf j is already inside leftTree

		let rl = this.trees.indexOf(rightTree.getLeftmostLeaf())
		let rr = this.trees.indexOf(rightTree.getRightmostLeaf())
		//console.log("addBranch " + i + "," + j + "--  " + ll + "," + lr + " -- " + rl + "," + rr)
		
		let rw = rr - rl + 1 // rightTree's width
		let splicedTree = this.trees.splice(rl, rw)
		//let splicedNodes = this.nodeManager.nodes.splice(rl, rw)
		this.trees.splice(lr+1, 0, ...splicedTree)
		//this.nodeManager.nodes.splice(lr+1, 0, ...splicedNodes)

		let label = leftTree.label + "," + rightTree.label
		let tree = new Tree(null, label, leftTree, rightTree, height)
		this.trees.push(tree)
		leftTree.parent = rightTree.parent = tree

		//console.log("addBranch leftLabel " + leftTree.label + " rightLabel " + rightTree.label)
		return true
	}

	getTopParent(index) {
		let ptr = this.trees[index]
		while (ptr.parent) {
			ptr = ptr.parent
		}
		return ptr
	}

	draw() {
		// Calculate leaf positions
		let numLeaf = this.nodeManager.nodes.length
		let x = this.position.x
		for (let i = 0; i < numLeaf; i++) {
			let y = this.position.y
			this.trees[i].position = createVector(x,y)
			x+= this.radius*2 + 5
		}

		// Draw branches
		let r = (this.trees.length > 0) ? this.trees[0].radius : 0
		for (let i = numLeaf; i < this.trees.length; i++) {
			let branch = this.trees[i]
			let xl = branch.left.position.x
			let xr = branch.right.position.x
			let x = (xl+xr)/2
			let y = this.position.y + this.radius + this.trees[i].height
			branch.position = createVector(x,y)

			push()
			stroke('white')
			stroke(getColour(branch.label[0]))
			line(xl, branch.position.y, branch.position.x, branch.position.y)
			line(xl, branch.position.y, xl, branch.left.position.y)
			stroke(getColour(branch.label[branch.label.length-1]))
			line(branch.position.x, branch.position.y, xr, branch.position.y)
			line(xr, branch.position.y, xr, branch.right.position.y)
			pop()

			push()
			translate(branch.position)
			fill('white')
			textAlign(CENTER,TOP)
			text(round(branch.height), 0,-15)
			pop()
		}

		// Draw leaves
		for (let i = 0; i < numLeaf; i++) {
			push()
			translate(this.trees[i].position)
			noStroke()
			fill(getColour(this.trees[i].node.label))
			ellipse(0,0, this.radius*2)
			fill('black')
			textAlign(CENTER,CENTER)
			text(this.trees[i].label, 0,0)
			pop()
		}
	}

	
}