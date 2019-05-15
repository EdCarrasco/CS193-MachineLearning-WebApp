let nodes = []
let clusterNodes = []
let button1 = null
let currentClass = 0
let tests = null
let knn = 0
let clustering = false
let NUM_CLUSTERS = 5
let FRAMERATE = 60

let tempClusters = []
let NOISE = 0.2
let CLUSTERING_FACTOR = 1

let nodeManager = null
let buttonProcessNext = null
let buttonProcessReset = null
let stepManager = null

/*

Finished:
- sliders for clustering and framerate
- load from file
- save to file
- better data randomization (that is not uniformly distributed)
- step-by-step mode (similar to one in Zybooks)
- improve step-by-step mode


Working on:
- scale data to fit within canvas
- improve load and save file to preserve data positions

Todo:
- show pseudo-code for each step
- add tooltips on mouseover to show helpful information
- add content to webpage besides webapp 
  (written content like paragraphs that explain how the algorithm works)
- 
- create real website

- graph for average squared distance (among all points)
- show objective function for the sum of all the points : squared distance to each point for each cluster center


STEP 1: each point has a line to each cluster
STEP 2: highlight closest line to cluster
STEP 3: color the points
STEP 4: move the cluster centers

Further reading:
- SPECTRAL CLUSTERING


*/