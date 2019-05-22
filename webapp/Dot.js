class TreeManager {
	constructor(pos) {
		this.trees = []
		this.pos = pos
		this.numLeaves = 0
	}

	addLeaf(pos, label, colour) {
		let leaf = new Tree(pos)
		//this.trees.push(leaf)
		this.trees.splice(this.numLeaves, 0, leaf)
		leaf.setIndex(this.trees.length-1)
		leaf.setLabel(label, colour)
		this.numLeaves++
	}

	outOfBounds_Leaves(index) {
		//console.log("outofBounds: " + index + ", numLeaves: " + this.numLeaves)
		return index < 0 || index >= this.numLeaves
	}

	outOfBounds_All(index) {
		return index < 0 || index >= this.trees.length
	}

	addBranch(i,j,height) {
		if (this.outOfBounds_Leaves(i) || this.outOfBounds_Leaves(j))
			return false
		if (i > j)
			[i,j] = [j,i] // swap
		let leftTree = this.getTopTree(i)
		let rightTree = this.getTopTree(j)
		let leftTreeWidth = leftTree.indexRight - leftTree.indexLeft + 1
		let rightTreeWidth = rightTree.indexRight - rightTree.indexLeft + 1
		if (j - i > 0 && leftTree.indexRight < j ) { // j must move to the left
			console.log(">>>> BRANCHING <<<<")
			let indexStart = leftTree.indexRight+1
			let subarray = this.trees.splice(rightTree.indexLeft, rightTreeWidth)
			this.trees.splice(leftTree.indexRight+1, 0, ...subarray)
			for (let k = 0; k < subarray.length; k++) {
				subarray[k].indexLeft = subarray[k].indexRight = indexStart+k
			}

			// Create new branch
			let xmean = (leftTree.pos.x + rightTree.pos.x) / 2
			let pos = createVector(xmean, height)
			let branch = new Tree(pos, leftTree, rightTree)
			branch.height = height
			branch.colour = leftTree.colour
			branch.label = leftTree.label+","+rightTree.label
			this.trees.push(branch)
			leftTree.parent = branch
			rightTree.parent = branch
			return true
		}
		return false
	}
	getTree(index) {
		//if (index < 0 || index >= this.trees.length)
		if (this.outOfBounds_All(index))
			return null
		return this.trees[index]
	}

	getTopTree(index) {
		//if (index < 0 || index >= this.trees.length)
		if (this.outOfBounds_All(index))
			return null

		let ptr = this.trees[index]
		while (ptr.parent) {
			ptr = ptr.parent
		}
		return ptr
	}

	update() {
		for (let i = 0; i < this.trees.length; i++) {
			this.trees[i].update(i)
		}
	}

	draw() {
		for (let i = 0; i < this.numLeaves; i++) {
			push()
			textAlign(CENTER,CENTER)
			fill('white')
			text(i, this.pos.x+i*50, 70)
			pop()
		}
		for (let i = this.trees.length-1; i >= 0; i--) {
			this.trees[i].draw(this.pos.x, this.pos.y)
		}
	}
}

class Tree {
	constructor(pos, left=null, right=null) {
		this.pos = pos
		this.left = left
		this.right = right
		this.parent = null
		this.label = "?"
		this.colour = 'white'
		this.indexLeft = (left) ? left.indexLeft : 0
		this.indexRight = (right) ? right.indexRight : 0
		this.height = 0
	}

	setLabel(label, colour='white') {
		this.label = char(65+this.indexLeft)
		this.colour = colour
	}

	setIndex(index) {
		this.indexLeft = index
		this.indexRight = index
	}

	setHeight(height) {
		this.height = height
	}

	update(index) {
		if (this.left && this.right) {
			let xmean = (this.left.pos.x+this.right.pos.x)/2
			this.pos = createVector(xmean, this.height)
			this.indexLeft = this.left.indexLeft
			this.indexRight = this.right.indexRight
		} else {
			this.pos = createVector(25*index,0)
			this.indexLeft = this.indexRight = index
		}
	}

	draw(xoffset=0, yoffset=0) {

		let x = this.pos.x + xoffset
		let y = this.pos.y + yoffset
		
		this.drawLines(xoffset, yoffset)
		

		push()
		fill(this.colour)
		ellipse(x, y, 15)
		fill('white')
		textAlign(CENTER,CENTER)
		let str = this.label//(this.indexLeft != this.indexRight) ? this.indexLeft+","+this.indexRight : this.indexLeft
		text(str, x, y)
		pop()
	}

	drawLines(xoffset=0, yoffset=0) {
		let x = this.pos.x + xoffset
		let y = this.pos.y + yoffset
		push()
		
		if (this.left && this.right) {
			stroke(this.left.colour)
			let leftX = this.left.pos.x + xoffset
			let leftY = this.left.pos.y + yoffset
			line(leftX, y, leftX, leftY)

			stroke(this.right.colour)
			let rightX = this.right.pos.x + xoffset
			let rightY = this.right.pos.y + yoffset
			line(rightX, y, rightX, rightY)

			stroke(this.left.colour)
			line(leftX, y,rightX, y)
		}
		pop()
	}
}