function setup() {
	let canvas = createCanvas(740, 500)
	canvas.parent('canvas-container')

	nodeManager = new NodeManager()
	treeManager = new TreeManager(createVector(100,100), nodeManager.nodes)
	/*for (let i = 0; i < 17; i++) {
		let x = 35*i
		let y = 0
		let pos = createVector(x,y)
		treeManager.addLeaf(pos, i+1, getColour(i+1))
	}

	for (let i = 0; i < 17; i++) {
		eyes.push(i)
	}
	console.log(eyes)
	height = 20*/
	
}

function draw() {
	background(51)
	push()
	fill('white')
	text("framerate: "+round(frameRate()), 10,10)
	pop()
	
	nodeManager.update()
	treeManager.update()

	nodeManager.draw()
	treeManager.draw()

	/*push()
	noStroke()
	if (a >= 0) ellipse(treeManager.pos.x+treeManager.trees[a].pos.x, treeManager.pos.y+treeManager.trees[a].pos.y, 25)
	if (b >= 0) ellipse(treeManager.pos.x+treeManager.trees[b].pos.x, treeManager.pos.y+treeManager.trees[b].pos.y, 25)
		pop()
	if (frameCount == 30) {
		a = floor(Math.random(1)*eyes.length)//eyes.splice(floor(Math.random(1)*eyes.length),1)[0]
		b = floor(Math.random(1)*eyes.length)//eyes.splice(floor(Math.random(1)*eyes.length),1)[0]
	}
	if (frameCount == 30+x*1) {
		if (!isNaN(a) && !isNaN(b)){
			let success = treeManager.addBranch(a,b,height)
			if (success) height += 20
		}
		x++
		a = floor(Math.random(1)*eyes.length)//eyes.splice(floor(Math.random(1)*eyes.length),1)[0]
		b = floor(Math.random(1)*eyes.length)//eyes.splice(floor(Math.random(1)*eyes.length),1)[0]
	}*/

	
	
}

function mousePressed() {
	/*let dot1 = treeManager.getTopDot(i)
	let dot2 = treeManager.getTopDot(j)
	//console.log(dot1)
	//console.log(dot2)
	let dotNew = treeManager.addBranch(dot1, dot2, 0+height)
	console.log(dotNew.left.label + " -- " + dotNew.right.label)
	height += 20
	i += 1
	j -= 1*/

	//tree = treeManager.getTopDot(5)
	//treeManager.moveLeft(tree)
}