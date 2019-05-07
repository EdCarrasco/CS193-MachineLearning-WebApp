(function () {
  let textFile = null
  let makeTextFile = function (text) {
    let data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
  };

  let saveButton = document.getElementById('file-save')

  saveButton.addEventListener('click', function () {
    console.log("clicked!")
    let link = document.createElement('a');
    link.setAttribute('download', 'data.txt');
    //link.href = makeTextFile(textbox.value);
    //document.body.appendChild(link);
    let array = nodesToArray()
    let string = arrayToString(array)
    link.href = makeTextFile(string)
    document.body.appendChild(link)

    // wait for the link to be added to the document
    window.requestAnimationFrame(function () {
      let event = new MouseEvent('click');
      link.dispatchEvent(event);
      document.body.removeChild(link);
		});
    
  }, false);
})();

function nodesToArray() {
  console.log("convertNodesToArray()...")
  let array = []
  for (let node of nodes) {
    let row = []
    row.push(node.position.x)
    row.push(node.position.y)
    row.push(node.nodeclass)
    array.push(row)
  }
  return array
}

function arrayToString(array) {
  let string = ''
  array.forEach(function(value) {
    string += value.join(' ') + '\n'
  })
  return string
}

function saveArrayAsTextFile(array) {
  console.log("saveArrayAsTextFile()...")
  let fs = require('fs')
  let file = fs.createWriteStream('sample.txt')
  file.on('error', function(error) { alert("Cannot create file.")})
  array.forEach(function(value) {
    file.write(value.join(' ') + '\n')
  })
  file.end()
  console.log("saved file successfully!")
}

function changeFramerate(fr) {
  FRAMERATE = parseInt(fr)
}

function clusterInput() {
  let slider = document.getElementById('clusters-slider'); 
  //document.getElementById('clusters-label').innerHTML = slider.value; 
  console.log("clusters " + slider.value)
  startClustering(slider.value);
}

function updateClusterLabel() {
  let slider = document.getElementById('clusters-slider'); 
  document.getElementById('clusters-label').innerHTML = slider.value; 
}

function drawFramerateBar() {
  let fr = frameRate()
  console.log(fr)
  fr = map(fr, 0,70, 0,width)
  push()
  strokeWeight(1)
  line(0,1, fr,1)
  pop()
}