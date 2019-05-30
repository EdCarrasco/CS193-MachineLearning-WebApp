let matrix = []
let smallest_i = 0
let smallest_j = 0
let smallestDistance = Infinity
let clusterGraph = null

function setup() {
	let canvas = createCanvas(640,480)
	canvas.parent('canvas-container')

	nodeManager = new NodeManager()
	clusterGraph = new ClusterGraph(width*0.55,height*0.05, nodeManager)

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