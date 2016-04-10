/**
 * Created by Alex on 16/11/2014.
 */
var Box = require('./../bvh2/Box');
var computeMortonCode = require('./../bvh2/Morton');

"use strict";
var pos_inf = Number.POSITIVE_INFINITY;
var neg_inf = Number.NEGATIVE_INFINITY;

function sortMortonCodes(n0, n1) {
    return n0._mortonCode - n1._mortonCode;
}

function computeNeighbourhood(boxes, resultDistances, resultNeighbours) {
    var i, j, l = boxes.length;
    var c0, c1, best, bestDistance, distance;
    //initialize distances
    for (i = 0; i < l; i++) {
        resultDistances[i] = pos_inf;
    }
    //compute nearest neighbour for each
    for (i = 0; i < l; i++) {
        c0 = boxes[i];
        best = 0;
        bestDistance = pos_inf;
        for (j = i + 1; j < l; j++) {
            c1 = boxes[j];
            distance = c0.distanceToBox(c1);
            if (distance < resultDistances[j]) {
                resultNeighbours[j] = bestDistance;
                resultNeighbours[j] = i;
            }
            if (distance < bestDistance) {
                best = j;
                bestDistance = distance;
            }
        }
        if (bestDistance < resultDistances[i]) {
            resultDistances[i] = bestDistance;
            resultNeighbours[i] = best;
        }
    }
}

var BVHNode = function (x0, y0, z0, x1, y1, z1) {
    this.leafValue = void 0;
    this.children = void 0;
    this._mortonCode = 0;
    this._surfaceArea = -1;
    this.parent = void 0;
    Box.prototype.setBounds.call(this, x0, y0, z0, x1, y1, z1);
};
BVHNode.prototype = Object.create(Box.prototype);
BVHNode.prototype.computeMortonCode = function () {
    "use strict";
    var cx = (this.x0 + this.x1) >> 1;
    var cy = (this.y0 + this.y1) >> 1;
    var cz = (this.z0 + this.z1) >> 1;
    return this._mortonCode = computeMortonCode(cx, cy, cz);
};
BVHNode.prototype.findBestMatch = function (childIndex, scoreFunction) {
    var children = this.children;
    var numChildren = children.length;
    var c0 = children[childIndex];
    var c1;
    var bestCost = Number.POSITIVE_INFINITY;
    var best;
    for (var i = 0; i < numChildren; i++) {
        if (i == childIndex) {
            continue; //skip self
        }
        c1 = children[i];
        var score = scoreFunction(c0, c1);
        if (score < bestCost) {
            bestCost = score;
            best = i;
        }
    }
    return best;
};
BVHNode.prototype.depth = function () {
    if (this.leafValue !== void 0 || this.children === void 0) {
        return 0;
    } else {
        return Math.max.apply(null, this.children.map(function (child) {
                return child.depth();
            })) + 1;
    }
};
BVHNode.prototype.balanceFactor = function () {
    var depths = [];
    var leafCount = 0;

    function processNode(n, depth) {
        if (n.leafValue === void 0) {
            n.children.forEach(function (c) {
                processNode(c, depth + 1);
            });
        } else {
            if (depths[depth] === void 0) {
                depths[depth] = 1;
            } else {
                depths[depth]++;
            }
            leafCount++;
        }
    }

    processNode(this, 0);
    var ds = [];
    var numberOfDepths = 0;
    var i, j;
    //find depth difference between leafs
    for (i = 0; i < depths.length; i++) {
        var d = depths[i];
        if (d === void 0) {
            continue;
        }
        numberOfDepths++;
        d /= leafCount; //normalize
        ds.push(d);
    }
    var result = Math.max.apply(this, ds);
    return result;
};
BVHNode.prototype.findGoodMatch = function (childIndex, scoreFunction) {
    var children = this.children;
    var numChildren = children.length;
    var c0 = children[childIndex];
    var c1;
    var bestCost = Number.POSITIVE_INFINITY;
    var best;
    for (var i = 0; i < numChildren; i++) {
        if (i == childIndex) {
            continue; //skip self
        }
        c1 = children[i];
        var score = scoreFunction(c0, c1);
        if (score < bestCost) {
            if (score <= 0) {
                //score is great already
                return i;
            }
            bestCost = score;
            best = i;
        }
    }
    return best;
};
BVHNode.prototype.computeSAHSum = function () {
    var result = this.getSurfaceArea();
    var children = this.children;
    if (children !== void 0) {
        children.forEach(function (c) {
            "use strict";
            result += c.computeSAHSum();
        });
    }
    return result;
};
BVHNode.prototype.computeVolumeSum = function () {
    "use strict";
    var result = (this.x1 - this.x0) * (this.y1 - this.y0) * (this.z1 - this.z0);
    if (this.children !== void 0) {
        this.children.forEach(function (c) {
            result += c.computeVolumeSum();
        });
    }
    return result;
};
BVHNode.prototype.combine2Children = function (i0, i1, c0, c1) {
    //take them out of list of children and create a node for them
    var n = new BVHNode(c0.x0, c0.y0, c0.z0, c0.x1, c0.y1, c0.z1);
    n.expandToFit(c1);
    //
    n.children = [c0, c1];
    //set parent values
    c0.parent = c1.parent = n;
    n.parent = this;
    //remove children from original node
    var children = this.children;
    //removal has to be done in order to ensure indices are valid
    var j0, j1;
    if (i0 > i1) {
        j0 = i0;
        j1 = i1;
    } else {
        j0 = i1;
        j1 = i0;
    }
    children.splice(j0, 1);
    children.splice(j1, 1, n);
    return j1;
};
BVHNode.prototype.findParentFor = function (x0, y0, z0, x1, y1, z1) {
    var candidate = this;
    while (candidate.leafValue === void 0) {
        var bestCost = Number.POSITIVE_INFINITY;
        var children = candidate.children;
        if (children === void 0) {
            break;
        }
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            var cost = child.costForInclusion(x0, y0, z0, x1, y1, z1);
            if (cost < bestCost) {
                candidate = child;
                if (cost === 0) {
                    //early bail, 0 cost is the best we can get
                    break;
                }
                bestCost = cost;
            }
        }
    }
    if (candidate.leafValue !== void 0) {
        return candidate.parent;
    } else {
        return candidate;
    }
};
BVHNode.prototype.split = function () {
    var bestDistances = [];
    var bestNeighbours = [];

    function splitNode(limit) {
        var children = this.children;
        var numChildren = children.length;
        while (numChildren > limit) {
            computeNeighbourhood(children, bestDistances, bestNeighbours);
            //get 2 which point at one another
            for (var i = 0; i < numChildren; i++) {
                var n0 = bestNeighbours[i];
                for (var j = i + 1; j < numChildren; j++) {
                    var n1 = bestNeighbours[j];
                    if (n0 == j && n1 === i) {
                        var c0 = children[i];
                        var c1 = children[j];
                        //found pair that point at each other
                        this.combine2Children(i, j, c0, c1);
                        numChildren--;
                        //prevent outer for-loop from iterating further
                        i = numChildren;
                        break;
                    }
                }
            }
        }
    }

    return splitNode;
}();
/**
 * Expands current node and all ancestors until root to accommodate for given box, terminate if node is already
 * large enough
 * @param box
 */
BVHNode.prototype.bubbleExpandToFit = function (box) {
    var node = this;
    while (node.expandToFit(box)) {
        node = node.parent;
        if (node === null || node === void 0) {
            break;
        }
    }
};
/**
 * If visitor returns false, traversal will not descend to children of that node
 * @param visitor
 */
BVHNode.prototype.traverse = function (visitor) {
    //if visitor returns false - we abandon the sub-hierarchy
    var children = this.children;
    for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        var continueFlag = visitor(child);
        if (continueFlag !== false) {
            child.traverse(visitor);
        }
    }
};
/**
 * Inserts multiple elements into subtree rooted at this node creating necessary hierarchy
 * @param boxes
 */
BVHNode.prototype.insertManyBoxes = function (boxes) {
    var numNodes = boxes.length;
    var i, n, box;
    //create leaf nodes
    var nodes = new Array(numNodes);
    for (i = 0; i < numNodes; i++) {
        box = boxes[i];
        n = new BVHNode(box.x0, box.y0, box.z0, box.x1, box.y1, box.z1);
        n.leafValue = box;
        n.computeMortonCode();
        nodes[i] = n;
    }
    nodes.sort(sortMortonCodes);
    while (numNodes > 2) {
        //sort leafs

        //pair
        for (i = 0; i < numNodes; i += 2) {
            var a = nodes[i];
            var b = nodes[i + 1];
            n = new BVHNode(a.x0, a.y0, a.z0, a.x1, a.y1, a.z1);
            n.children = [a, b];
            a.parent = n;
            b.parent = n;
            //n.computeMortonCode();
            n.expandToFit(b);
            nodes[i >> 1] = n;
        }
        numNodes = (numNodes >> 1) + numNodes % 2;
        //nodes.length = numNodes;
    }
    var children = this.children;
    if (children == void 0) {
        children = this.children = [];
    }
    nodes.length = numNodes;

    Array.prototype.push.apply(children, nodes);
    //parent nodes
    for (i = 0; i < numNodes; i++) {
        n = nodes[i];
        n.parent = this;
        this.expandToFit(n);
    }
};
BVHNode.prototype.splitOctal = function (binNodeVisitor) {
    //splits a node in a fast manner using 6 sub-volumes
    var children = this.children;
    //find axis split
    var x2 = (this.x1 + this.x0) / 2;
    var y2 = (this.y1 + this.y0) / 2;
    var z2 = (this.z1 + this.z0) / 2;
    //sanity check on axis
    if (Number.isNaN(x2)) {
        x2 = 0;
    }
    if (Number.isNaN(y2)) {
        y2 = 0;
    }
    if (Number.isNaN(z2)) {
        z2 = 0;
    }
    //
    var i, bin;
    var bins = new Array(8);
    for (i = 0; i < 8; i++) {
        bin = bins[i] = new BVHNode(pos_inf, pos_inf, pos_inf, neg_inf, neg_inf, neg_inf);
        bin.parent = this;
        bin.children = [];
    }
    function binChild(child, index, binIndex) {
        bin = bins[binIndex];
        child.parent = bin;
        bin.children.push(child);
        bin.expandToFit(child);
    }

    //
    function tryBinningChild(child, index) {
        if (child.x0 > x2) {
            if (child.y0 > y2) {
                if (child.z0 > z2) {
                    binChild(child, index, 0);
                    return true;
                } else if (child.z1 <= z2) {
                    binChild(child, index, 1);
                    return true;
                }
            } else if (child.y1 <= y2) {
                if (child.z0 > z2) {
                    binChild(child, index, 2);
                    return true;
                } else if (child.z1 <= z2) {
                    binChild(child, index, 3);
                    return true;
                }
            }
        } else if (child.x1 <= x2) {
            if (child.y0 > y2) {
                if (child.z0 > z2) {
                    binChild(child, index, 4);
                    return true;
                } else if (child.z1 <= z2) {
                    binChild(child, index, 5);
                    return true;
                }
            } else if (child.y1 <= y2) {
                if (child.z0 > z2) {
                    binChild(child, index, 6);
                    return true;
                } else if (child.z1 <= z2) {
                    binChild(child, index, 7);
                    return true;
                }
            }
        }
        return false;
    }

    var binnedPrevious = false;
    var binnedStartIndex = -1; //this is used to buffer array splices, so we can do a few in a row if possible
    for (i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        var binnedCurrent = tryBinningChild(child, i);
        if (binnedCurrent) {
            if (!binnedPrevious) {
                binnedStartIndex = i;
            }
            binnedPrevious = true;
        } else if (!binnedCurrent && binnedPrevious) {
            //batched splices work faster
            children.splice(i + 1, binnedStartIndex - i);
            binnedPrevious = false;
        }
    }
    //create nodes for non-empty bins
    for (i = 0; i < 8; i++) {
        bin = bins[i];
        var binLength = bin.children.length;
        if (binLength === 0) {
            continue;
        }
        this.children.push(bin);
        //no need to expand original node since containment remains the same
        //call visitor if it exists
        if (binNodeVisitor !== void 0) {
            binNodeVisitor(bin);
        }
    }
};
BVHNode.prototype.rebuild = function () {
    //collect all elements from leaf nodes
    var elements = [];
    this.traverse(function (node) {
        if (node.leafValue !== void 0) {
            elements.push(node.leafValue);
        }
    });
    this.children = []; //drop old hierarchy
    this.insertManyBoxes(elements); //re-create new hierarchy
};
module.exports = BVHNode;
