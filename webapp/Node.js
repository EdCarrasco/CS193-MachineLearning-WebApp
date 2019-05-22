class Node {
	constructor(position, nodeclass, type='DATA', radius=5, label='') {
		this.position = position
		this.prevposition = position
		this.nodeclass = nodeclass
		this.distance = 0
		this.colour = 'black'
		this.type = type
		this.nodeChildren = []
		this.nodeParent = null
		this.radius = radius
		this.label = label

		this.setClass(nodeclass)
	}

	distanceTo(position) {
		return dist(this.position.x,this.position.y, position.x,position.y)
	}

	setClass(nodeclass) {
		this.nodeclass = nodeclass
		this.colour = getColour(nodeclass)
		/*switch(this.nodeclass) {
			case 0: this.colour = 'white'; break;
			case 1: this.colour = 'red';break;
			case 2: this.colour = 'green'; break;
			case 3: this.colour = 'blue'; break;
			case 4: this.colour = 'yellow'; break;
			case 5: this.colour = 'lightgreen'; break;
			case 6: this.colour = 'orange'; break;
			case 7: this.colour = 'brown'; break;
			case 8: this.colour = 'darkblue'; break;
			case 9: this.colour = 'lightblue'; break;
			case 10: this.colour = 'purple'; break;
			case 11: this.colour = 'pink'; break;
			case 12: this.colour = color(255, 90, 0); break;
			case 13: this.colour = color(204, 102, 153); break;
			case 14: this.colour = color(102, 102, 153); break;
			default: this.colour = 'black'; break;
		}*/
	}

	update() {
	}

	draw() {
		push()
		translate(this.position)
		fill(this.colour)
		if (this.type == 'CLUSTER') {
			rectMode(CENTER)
			rect(0,0, 20,20)
			fill('black')

			textAlign(CENTER,CENTER)
			textSize(10)
			text(this.nodeChildren.length,0,0)
		} else if (this.type == 'DATA') {
			noStroke()
			ellipse(0, 0, this.radius)
		} else if (this.type == 'TEMP') {
			noStroke()
			fill('black')
			ellipse(0,0, 5)
		}
		pop()

		this.drawLabel()
	}

	drawLabel() {
		push()
		translate(this.position)
		textAlign(CENTER,CENTER)
		text(this.label, 0,0)
		pop()
	}
}