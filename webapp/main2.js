let matrix = []
let smallest_i = 0
let smallest_j = 0
let smallestDistance = Infinity
function setup() {
	let canvas = createCanvas(640,480)
	canvas.parent('canvas')
}

function draw() {
	background(51)
	push()
	fill(200)
	rect(width*0.55,height*0.05,width*0.40,height*0.90)//rect(width*0.5,height*0.9, width*0.5, height*1)
	pop()

	// ================
	// GENERATE MATRIX
	matrix = []
	for (let i = 0; i < nodes.length; i++) {
		let row = []
		for (let j = 0; j < nodes.length; j++) {
			let p1 = nodes[i].position
			let p2 = nodes[j].position
			let distance = dist(p1.x, p1.y, p2.x, p2.y)
			distance = floor(distance)
			row.push(distance)
		}
		matrix.push(row)
	}
	// ================
	// SEARCH MATRIX
	if (nodes.length == 0) {
		return
	}
	smallestDistance = Infinity
	smallest_i = 0
	smallest_j = 0
	for (let i = 1; i < matrix.length; i++) {
		for (let j = 0; j < i; j++) {
			let distance = matrix[i][j]
			if (distance < smallestDistance) {
				smallestDistance = distance
				smallest_i = i
				smallest_j = j
			}
		}
	}
	push()
	let pi = nodes[smallest_i].position
	let pj = nodes[smallest_j].position
	noStroke()
	fill('red')
	ellipse(pi.x, pi.y, 25)
	fill('blue')
	ellipse(pj.x, pj.y, 25)
	pop()
	
	

	// ================

	for (let i = 0; i < nodes.length; i++) {
		nodes[i].update()
	}

	for (let i = 0; i < nodes.length; i++) {
		nodes[i].draw()
		push()
		fill('black')
		textAlign(CENTER,CENTER)
		text(i+1, nodes[i].position.x, nodes[i].position.y)
		pop()
	}


	push()
	let line_i = 0
	let line_j = 0
	let nodey = height*0.1-0
	for (let i = 0; i < nodes.length; i++) {
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
}

function mouseMoved() {
	
	let offset = 5
	for (let i = 0; i < nodes.length; i++) {
		let x = nodes[i].position.x
		let y = nodes[i].position.y
		if (x >= mouseX-offset && x <= mouseX+5 &&
			y >= mouseY-offset && y <= mouseY+5) {
			nodes[i].position = createVector(mouseX,mouseY)
		}
	}
}