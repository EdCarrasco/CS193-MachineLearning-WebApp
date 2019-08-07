let nodeManager
let treeManager
let clusterManager

let SINGLE_LINKAGE = 0
let COMPLETE_LINKAGE = 1
let AVERAGE_LINKAGE = 2

let autoplay = false
let buttonAutoplay = null

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

function buttonToggleAutoplay() {
	autoplay = !autoplay
	
	
}

function updateAutoplayButton() {
	if (!buttonAutoplay) return
	buttonAutoplay.innerHTML = (autoplay) ? "pause" : "play_arrow"
}

function buttonRandomize() {
	let slider = document.getElementById('amount-slider')
	let amount = slider.value
	let topLeftBoundary = createVector(10,10)
	let bottomRightBoundary = createVector(width*0.4,height-10)

	nodeManager.initialize()
	nodeManager.createMultipleNodes(amount, topLeftBoundary, bottomRightBoundary)
	clusterManager.populateMatrices()
}

function updateAmountSlider() {
	let slider = document.getElementById('amount-slider')
	let label = document.getElementById('amount-label')
	label.innerHTML = slider.value
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
	clusterManager.setViewType(SINGLE_LINKAGE)
	treeManager.setViewType(SINGLE_LINKAGE)
	//clusterManager.initialize()
	//treeManager.initialize()
}

function buttonCompleteLinkage() {
	clusterManager.setViewType(COMPLETE_LINKAGE)
	treeManager.setViewType(COMPLETE_LINKAGE)
	//clusterManager.initialize()
	//treeManager.initialize()
}

function buttonAverageLinkage() {
	clusterManager.setViewType(AVERAGE_LINKAGE)
	treeManager.setViewType(AVERAGE_LINKAGE)
	//clusterManager.initialize()
	//treeManager.initialize()
}

/*==========================================================*/

function setup() {
	let canvas = createCanvas(1520, 400)
	canvas.parent('canvas-container')
	buttonAutoplay = document.getElementById('button-autoplay-icon')
	
	clusterManager = new ClusterManager(createVector(width*0.7+5,50))
	treeManager = new TreeManager(createVector(width*0.45,20))
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

	let topLeft = createVector(20,20)
	let bottomRight = createVector(width*0.2,height-20)
	nodeManager.createMultipleNodes(10, topLeft, bottomRight)
	clusterManager.populateMatrices()
}

function draw() {
	background(51)

	updateAmountSlider()
	updateAutoplayButton()

	if (autoplay && clusterManager.clustersSL.length > 1) {
		buttonNext()
	}

	treeManager.draw()
	clusterManager.draw()
	nodeManager.draw()
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
		case 7: colour = color(102, 102, 153); break; // grey blue
		case 8: colour = 'purple'; break;
		case 9: colour = 'lightblue'; break;
		case 10: colour = 'pink'; break;
		case 11: colour = 'darkblue'; break;
		case 12: colour = 'brown'; break;
		case 13: colour = color(255, 90, 0); break; // dark orange
		case 14: colour = color(204, 102, 153); break; // dark pink
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
			let x = randomBounded(topLeft.x, width/3)
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
		//console.log("addNode :: array size: " + this.nodes.length)
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

	drawTiny(offset, xdir, ydir, isRotated, radius) {
		let n = this.nodes.length
		push()
		translate(offset)
		for (let i = 0; i < n; i++) {
			let x = xdir * floor(i / 3) * 6
			let y = ydir * (i % 3) * 6
			fill(getColour(this.nodes[i].label))
			noStroke()
			if (isRotated)
				ellipse(y,x, radius)
			else
				ellipse(x,y, radius)
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
		
		this.closestPairIndex = [[-1,-1],[-1,-1],[-1,-1]]

		this.smallestDistanceSL = -1
		this.smallestDistanceCL = -1
		this.smallestDistanceAL = -1

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

	setViewType(type) {
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

	/*
	USAGE DOCUMENT
	DESIGN -- considerations, what was difficult
	1-2 pages each
	*/

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

		let dataSL = [null,null,-1]
		let dataCL = [null,null,-1]
		let dataAL = [null,null,-1]

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
					this.closestPairIndex[SINGLE_LINKAGE] = [r,c]
					smallestDistanceSL = distanceSL
					dataSL = [this.clustersSL[r], this.clustersSL[c], distanceSL]
				}
				if (distanceCL < smallestDistanceCL && distanceCL >= 0) {
					this.closestPairIndex[COMPLETE_LINKAGE] = [r,c]
					smallestDistanceCL = distanceCL
					dataCL = [this.clustersCL[r], this.clustersCL[c], distanceCL]
				}
				if (distanceAL < smallestDistanceAL && distanceAL >= 0) {
					this.closestPairIndex[AVERAGE_LINKAGE] = [r,c]
					smallestDistanceAL = distanceAL
					dataAL = [this.clustersAL[r], this.clustersAL[c], distanceAL]
				}
			}
			this.matrixSL.push(rowSL)
			this.matrixCL.push(rowCL)
			this.matrixAL.push(rowAL)
		}
		return [dataSL, dataCL, dataAL]
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
			this.treeManager.addBranch(SINGLE_LINKAGE, clusterA_SL.nodes[0], clusterB_SL.nodes[0], distanceSL)
		}
		if (clusterA_CL && clusterB_CL) {
			this.mergeClusters(this.clustersCL, clusterA_CL, clusterB_CL)
			this.treeManager.addBranch(COMPLETE_LINKAGE, clusterA_CL.nodes[0], clusterB_CL.nodes[0], distanceCL)
		}
		if (clusterA_AL && clusterB_AL) {
			this.mergeClusters(this.clustersAL, clusterA_AL, clusterB_AL)
			this.treeManager.addBranch(AVERAGE_LINKAGE, clusterA_AL.nodes[0], clusterB_AL.nodes[0], distanceAL)
		}
	}

	indexOf(cluster) {
		return this.nodeManager.indexOf(cluster.nodes[0])
	}

	getClusterArray(type) {
		switch(this.viewType) {
			case SINGLE_LINKAGE: return this.clustersSL
			case COMPLETE_LINKAGE: return this.clustersCL
			case AVERAGE_LINKAGE: return this.clustersAL
			default: return this.clustersSL
		}
	}

	getMatrixArray(type) {
		switch(this.viewType) {
			case SINGLE_LINKAGE: return this.matrixSL
			case COMPLETE_LINKAGE: return this.matrixCL
			case AVERAGE_LINKAGE: return this.matrixAL
			default: return this.matrixSL
		}
	}

	draw() {
		let clusterArray = this.getClusterArray(this.viewType)
		let matrixArray = this.getMatrixArray(this.viewType)
		for (let cluster of clusterArray) {
			cluster.draw()
		}

		this.drawMatrix(matrixArray, clusterArray, this.closestPairIndex[this.viewType])

		/*

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
			let posA = (this.type == AVERAGE_LINKAGE) ? this.lastResult[0] : /this.lastResult[0].position
			let posB = (this.type == AVERAGE_LINKAGE) ? this.lastResult[1] : this.lastResult[1].position
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

		*/
	}

	drawMatrix(matrixArray, clusterArray, closestPair) {
		push()
		translate(this.position)
		textAlign(LEFT,CENTER)
		let xcell = 32
		let ycell = 26
		let radius = 6
		for (let r = 0; r < matrixArray.length; r++) {
			let yoffset = (clusterArray[r].nodes.length == 2) ? 4 : 
										(clusterArray[r].nodes.length >= 3) ? 8 :
										0
			let xoffset = (clusterArray[r].nodes.length == 1) ? 8 :
										(clusterArray[r].nodes.length == 2) ? 4 :
										0
			clusterArray[r].drawTiny(createVector(-20, r*ycell-yoffset), -1, 1, false, radius)
			clusterArray[r].drawTiny(createVector(r*xcell+xoffset, -20), -1, 1, true, radius)
			for (let c = 0; c < matrixArray.length; c++) {
				if (r == closestPair[0] && c == closestPair[1])
					fill('orange')
				else
					fill(200)
				if (matrixArray[r][c] >= 0)
					text(round(matrixArray[r][c]), c*xcell, r*ycell)
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
		this.treesSL = []
		this.treesCL = []
		this.treesAL = []
		this.nodeManager = null
		this.clusterManager = null
		this.radius = 10
		this.viewType = SINGLE_LINKAGE
	}

	linkNodeManager(nm) {this.nodeManager = nm}
	linkClusterManager(cm) {this.clusterManager = cm}

	initialize() {
		this.treesSL = []
		this.treesCL = []
		this.treesAL = []
		//let x = 0
		for (let node of this.nodeManager.nodes) {
			//let position = createVector(this.position.x+x, this.position.y)
			let treeSL = new Tree(node, node.label, null, null, 0)
			let treeCL = new Tree(node, node.label, null, null, 0)
			let treeAL = new Tree(node, node.label, null, null, 0)
			this.treesSL.push(treeSL)
			this.treesCL.push(treeCL)
			this.treesAL.push(treeAL)
			//x += 20
		}
	}

	setViewType(type) {
		this.viewType = type
	}

	addBranch(type, nodeA, nodeB, height) {
		if (nodeA == nodeB) {
			console.log("addBranch -- failed: same node")
			return false // cant combine same leaf
		}

		let treeArray = this.getTreeArray(type)
		
		let i = this.indexOf(treeArray, nodeA)
		let j = this.indexOf(treeArray, nodeB)
		if (i > j) {[i,j]=[j,i]}

		let leftTree = this.getTopParent(treeArray, i)
		let rightTree = this.getTopParent(treeArray, j)

		//let ll = array.indexOf(leftTree.getLeftmostLeaf())
		let lr = treeArray.indexOf(leftTree.getRightmostLeaf())
		if (lr >= j) return false // leaf j is already inside leftTree

		let rl = treeArray.indexOf(rightTree.getLeftmostLeaf())
		let rr = treeArray.indexOf(rightTree.getRightmostLeaf())
		
		let rw = rr - rl + 1 // rightTree's width
		let splicedTree = treeArray.splice(rl, rw)
		treeArray.splice(lr+1, 0, ...splicedTree)

		let label = leftTree.label + "," + rightTree.label
		let tree = new Tree(null, label, leftTree, rightTree, height)
		leftTree.parent = rightTree.parent = tree
		treeArray.push(tree)
		
		return true
	}

	indexOf(treeArray, node) {
		for (let i = 0; i < treeArray.length; i++) {
			if (node == treeArray[i].node) {
				return i
			}
		}
		return -1
	}

	getTopParent(array, index) {
		let ptr = array[index]
		while (ptr.parent) {
			ptr = ptr.parent
		}
		return ptr
	}

	getTreeArray(type) {
		switch (type) {
			case SINGLE_LINKAGE: return this.treesSL
			case COMPLETE_LINKAGE: return this.treesCL
			case AVERAGE_LINKAGE: return this.treesAL
			default: return this.treesSL
		}
	}

	draw() {
		let array = this.getTreeArray(this.viewType)
		let numLeaves = this.nodeManager.nodes.length
		this.calcLeafPositions(array, numLeaves)
		this.drawBranches(array, numLeaves)
		this.drawBranches(array, numLeaves)
		this.drawLeaves(array, numLeaves)
	}

	calcLeafPositions(array, numLeaves) {
		let x = this.position.x
		for (let i = 0; i < numLeaves; i++) {
			let y = this.position.y
			array[i].position = createVector(x,y)
			x+= this.radius*2 + 5
		}
	}

	drawBranches(array, numLeaves) {
		let r = (array.length > 0) ? array[0].radius : 0
		for (let i = numLeaves; i < array.length; i++) {
			let branch = array[i]
			let xl = branch.left.position.x
			let xr = branch.right.position.x
			let x = (xl+xr)/2
			let y = this.position.y + this.radius +array[i].height
			branch.position = createVector(x,y)

			this.drawBranchLines(branch, xl, xr)
			this.drawBranchText(branch)
		}
	}

	drawBranchLines(branch, xl, xr) {
		push()
		stroke('white')
		stroke(getColour(branch.label[0]))
		line(xl, branch.position.y, branch.position.x, branch.position.y)
		line(xl, branch.position.y, xl, branch.left.position.y)
		stroke(getColour(branch.label[branch.label.length-1]))
		line(branch.position.x, branch.position.y, xr, branch.position.y)
		line(xr, branch.position.y, xr, branch.right.position.y)
		pop()
	}

	drawBranchText(branch) {
		push()
		translate(branch.position)
		fill('white')
		textAlign(CENTER,TOP)
		text(round(branch.height), 0,-15)
		pop()
	}

	drawLeaves(array, numLeaves) {
		for (let i = 0; i < numLeaves; i++) {
			push()
			translate(array[i].position)
			noStroke()
			fill(getColour(array[i].node.label))
			ellipse(0,0, this.radius*2)
			fill('black')
			textAlign(CENTER,CENTER)
			text(array[i].label, 0,0)
			pop()
		}
	}
}