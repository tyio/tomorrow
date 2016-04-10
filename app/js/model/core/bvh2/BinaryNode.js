/**
 * Created by Alex on 17/11/2014.
 */
var Node = require('./Node');
var LeafNode = require('./LeafNode');

"use strict";
var BinaryNode = function () {
    this.a = void 0;
    this.b = void 0;
};
BinaryNode.prototype = Object.create(Node.prototype);
BinaryNode.prototype.setChildren = function (a, b) {
    this.a = a;
    this.b = b;

    this.refitFor2();

    a.parentNode = this;
    b.parentNode = this;
};
BinaryNode.prototype.findParentFor = function (box) {
    var a = this.a;
    var b = this.b;
    if (a === void 0 || b === void 0) {
        //TODO: make sure this doesn't lead to bad tree
        //unbalanced node, good candidate already
        return this;
    }
    var aCost = a.costForInclusion(box);
    var bCost = b.costForInclusion(box);
    if (aCost < bCost) {
        if (a instanceof BinaryNode) {
            return a.findParentFor(box);
        } else {
            return a;
        }
    } else if (b instanceof BinaryNode) {
        return b.findParentFor(box);
    } else {
        return b;
    }
};
BinaryNode.prototype.traverse = function (visitor) {
    if (this.a !== void 0) {
        var cA = visitor(this.a);
        if (cA !== false) {
            this.a.traverse(visitor);
        }
    }
    if (this.b !== void 0) {
        var cB = visitor(this.b);
        if (cB !== false) {
            this.b.traverse(visitor);
        }
    }
};
BinaryNode.prototype.traversePreOrder = function (visitor) {
    var carryOn = visitor(this);
    if (carryOn !== false) {
        //left
        if (this.a instanceof BinaryNode) {
            this.a.traversePreOrder(visitor);
        } else if (this.a instanceof  LeafNode) {
            visitor(this.a);
        }
        //right
        if (this.b instanceof BinaryNode) {
            this.b.traversePreOrder(visitor);
        } else if (this.b instanceof  LeafNode) {
            visitor(this.b);
        }
    }
};
BinaryNode.prototype.validate = function () {
    var violatingNodes = 0;
    this.traversePreOrder(function (n) {
        if (n instanceof BinaryNode) {
            var isValid = n.validateNode();
            if (!isValid) {
                violatingNodes++;
            }
        }
    });
    return violatingNodes > 0;
};
BinaryNode.prototype.validateNode = function () {
    var self = this;

    function validateChild(child) {
        if (child === void 0) {
            return true;
        }
        if (child.parentNode !== self) {
            return false;
        }
        if (!self.containsBox(child)) {
            return false;
        }
    }

    var aValid = validateChild(this.a);
    var bValid = validateChild(this.b);
    return aValid && bValid;
};
BinaryNode.prototype.validateContainment = function (violation) {
    if (this.a !== void 0) {
        if (!this.containsBox(this.a)) {
            violation(this.a)
        } else if (this.a instanceof BinaryNode) {
            this.a.validateContainment(violation);
        }

    }
    if (this.b !== void 0) {
        if (!this.containsBox(this.b)) {
            violation(this.b)
        } else if (this.b instanceof BinaryNode) {
            this.b.validateContainment(violation);
        }
    }
};
BinaryNode.prototype.refitFor2 = function () {
    var a = this.a;
    var b = this.b;

    this.x0 = Math.min(a.x0, b.x0);
    this.y0 = Math.min(a.y0, b.y0);
    this.z0 = Math.min(a.z0, b.z0);
    this.x1 = Math.max(a.x1, b.x1);
    this.y1 = Math.max(a.y1, b.y1);
    this.z1 = Math.max(a.z1, b.z1);
};
BinaryNode.prototype.refit = function () {
    if (this.a !== void 0 && this.b !== void 0) {
        this.refitFor2();
    } else if (this.a !== void 0) {
        this.copy(this.a);
    } else if (this.b !== void 0) {
        this.copy(this.b);
    }
};
function sortMortonCodes(n0, n1) {
    return n0._mortonCode - n1._mortonCode;
}

BinaryNode.prototype.insertManyBoxes2 = function(leafCallback, numNodes){
    var i, n;
    //create leaf nodes
    var nodes = new Array(numNodes);
    for (i = 0; i < numNodes; i++) {
        n = new LeafNode();
        //leaf needs to be set up inside the callback
        leafCallback(n,i);
        n._mortonCode = n.computeMortonCode();
        nodes[i] = n;
    }
    nodes.sort(sortMortonCodes);
    while (numNodes > 2) {
        //sort leafs

        //pair
        for (i = 0; i < numNodes; i += 2) {
            var a = nodes[i];
            var b = nodes[i + 1];
            n = new BinaryNode();
            n.setChildren(a, b);
            nodes[i >> 1] = n;
        }
        numNodes = (numNodes >> 1) + numNodes % 2;
        //nodes.length = numNodes;
    }
    //finally insert these boxes from this node
    nodes.length = numNodes;
    for (i = 0; i < numNodes; i++) {
        n = nodes[i];
        this.insertNode(n);
    }
};
/**
 * @param boxes
 */
BinaryNode.prototype.insertManyBoxes = function (boxes) {
    var numNodes = boxes.length;
    var box;
    this.insertManyBoxes2(function(leaf, index){
        box = boxes[index];
        leaf.object = box.object;
        leaf.setBounds(box.x0, box.y0, box.z0, box.x1, box.y1, box.z1);
    }, numNodes);
};
BinaryNode.prototype.bubbleRefit = function () {
    var n = this;
    while (n !== void 0) {
        n.refit();
        n = n.parentNode;
    }
};
BinaryNode.prototype.traverseSegmentLeafIntersections = function (startX, startY, startZ, endX, endY, endZ, visitor) {

    this.traversePreOrder(function (node) {
        var b = node.intersectSegment(startX, startY, startZ, endX, endY, endZ);
        if (!b) {
            return false;
        }
        if (node instanceof LeafNode) {
            visitor(node);
            return false;
        } else {
            return true;
        }
    });
};
BinaryNode.prototype.traverseRayLeafIntersections = function (startX, startY, startZ, directionX, directionY, directionZ, visitor) {
    this.traversePreOrder(function (node) {
        var b = node.intersectRay(startX, startY, startZ, directionX, directionY, directionZ);
        if (!b) {
            return false;
        }
        if (node instanceof LeafNode) {
            visitor(node);
            return false;
        } else {
            return true;
        }
    });
};
BinaryNode.prototype.insert = function (x0, y0, z0, x1, y1, z1, box) {
    var leaf = new LeafNode(box);
    leaf.setBounds(x0, y0, z0, x1, y1, z1);
    this.insertNode(leaf);
    return leaf;
};
BinaryNode.prototype.insertNode = function (child) {
    var node = this.findParentFor(child);
    var bNode, parent;
    if (node instanceof BinaryNode) {
        if (node.a === void 0) {
            node.a = child;
            child.parentNode = node;
            node.bubbleExpandToFit(child);
        } else if (node.b === void 0) {
            node.b = child;
            child.parentNode = node;
            node.bubbleExpandToFit(child);
        } else {
            //take right child and insert another binary node there
            bNode = new BinaryNode();
            bNode.setChildren(node.b, child);
            //
            node.b = bNode;
            bNode.parentNode = node;
            node.bubbleExpandToFit(bNode);
        }
    } else {
        //it's a leaf
        bNode = new BinaryNode();
        //
        parent = node.parentNode;
        if (node === parent.a) {
            parent.a = bNode;
        } else if (node === parent.b) {
            parent.b = bNode;
        } else {
            throw new Error("Not a child of specified parent node(impostor)");
        }
        bNode.setChildren(node, child);
        bNode.parentNode = parent;
        parent.bubbleExpandToFit(bNode);
    }
    return child;
};
module.exports = BinaryNode;