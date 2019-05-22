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

function CombineNext() {
	clusterGraph.generateDistanceMatrix()
	clusterGraph.searchDistanceMatrix()
	clusterGraph.combineClosestNodeGroups()
}

function draw() {
	background(51)
	
	push()
	fill(200)
	rect(width*0.55,height*0.05,width*0.44,height*0.90)//rect(width*0.5,height*0.9, width*0.5, height*1)
	pop()

	if (clusterGraph.nM.nodes.length < 1)
		return

	clusterGraph.update()
	clusterGraph.draw()

	nodeManager.update()
	nodeManager.draw()

	/*push()
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
	pop()*/
	/*push()
	let liney = nodey + 25/2 + smallestDistance
	line(line_i,liney, line_j,liney)
	line(line_i,liney, line_i,nodey+25/2)
	line(line_j,liney, line_j,nodey+25/2)
	let avgx = (line_i+line_j)/2
	textAlign(CENTER,CENTER)
	text(smallestDistance, avgx, liney+10)
	pop()*/

	moveNode();
}

function moveNode() {
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