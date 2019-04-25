class Node {
	constructor(position, nodeclass, isCluster) {
		this.position = position
		this.nodeclass = nodeclass
		this.distance = 0
		this.color = 'black'
		this.isCluster = isCluster | false
		this.nodeChildren = []
	}

	distanceTo(position) {
		return dist(this.position.x,this.position.y, position.x,position.y)
	}

	update() {
		this.distance = dist(mouseX, mouseY, this.position.x, this.position.y)
		switch(this.nodeclass) {
			case 0: this.color = 'white'; break;
			case 1: this.color = 'red'; break;
			case 2: this.color = 'green'; break;
			case 3: this.color = 'blue'; break;
			case 4: this.color = 'yellow'; break;
			case 5: this.color = 'darkblue'; break;
			case 6: this.color = 'brown'; break;
			case 7: this.color = 'orange'; break;
			case 8: this.color = 'purple'; break;
			case 9: this.color = 'lightblue'; break;
			case 10: this.color = 'lightgreen'; break;
			case 11: this.color = 'pink'; break;
			case 12: this.color = color(255, 90, 0); break;
			case 13: this.color = color(204, 102, 153); break;
			case 14: this.color = color(102, 102, 153); break;
			default: this.color = 'black'; break;
		}
	}

	draw() {
		push()
		translate(this.position)
		fill(this.color)
		if (this.isCluster) {
			rectMode(CENTER)
			rect(0,0, 20,20)
			fill('black')

			textAlign(CENTER,CENTER)
			text(this.nodeChildren.length,0,0)
		} else {
			noStroke()
			ellipse(0, 0, 15)
		}
		pop()
	}
}