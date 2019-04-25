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
