/**
 * Created by goa1yok on 5/11/2014.
 */






var BVH = function () {
    "use strict";
    var self = this;
    var pos_inf = Number.POSITIVE_INFINITY;
    var neg_inf = Number.NEGATIVE_INFINITY;
    var root = this.root = new BVHNode(pos_inf, pos_inf, pos_inf, neg_inf, neg_inf, neg_inf);
    var numElements = 0;
    var maxChildren = 12;
    this.__fastSplitThreshold = 50;
    var splitLimit = 2; //keep splitting until this number of children is left

    //reusing arrays allows us to save on memory usage. These arrays are bound in size by maxChildren value
    var bestDistances = [];
    var bestNeighbours = [];


    function optimizeReinsert(node, steps, costFunction) {
        //traverse nodes, sort them by cost

    }


    function insertMany(node, boxes) {
        var children = node.children;
        if (children === void 0) {
            node.children = children = [];
        }
        boxes.forEach(function (box) {
            var n = new BVHNode(box.x0, box.y0, box.z0, box.x1, box.y1, box.z1);
            n.parent = node;
            n.leafValue = box;
            children.push(n);
        });
        numElements += boxes.length;
        reduceNodeFast(node);
        //now expand root to fit all children
        children.forEach(node.expandToFit, node);
    }


    function reduceNodeFast(node) {
        var children = node.children;
        var numChildren = children.length;
        if (numChildren > self.__fastSplitThreshold) {
            node.splitOctal(function (binChild) {
                reduceNodeFast(binChild);
            });
        }
        reduceNode(node);
    }

    function reduceNode(node) {
        var a, b;
        var i, j, k;
        i = 0;
        var children = node.children;
        j = node.findGoodMatch(i, scoreBoxesSAHDelta);
        var numChildren = children.length;
        while (numChildren > 2) {
            k = node.findGoodMatch(j, scoreBoxesSAHDelta);
            if (i == k) {
                //match found
                a = children[i];
                b = children[j];
                //combine
                i = node.combine2Children(i, j, a, b);
                j = node.findGoodMatch(i, scoreBoxesSAHDelta);
                numChildren--;
            } else {
                i = j;
                j = k;
            }
        }
    }


    function insertElement(x0, y0, z0, x1, y1, z1, object) {
        var host = root.findParentFor(x0, y0, z0, x1, y1, z1);
        //create new node
        var t = new BVHNode(x0, y0, z0, x1, y1, z1);
        t.parent = host;
        t.leafValue = object;
        host.bubbleExpandToFit(t);
        var children = host.children;
        if (children === void 0) {
            children = host.children = [];
        }
        children.push(t);
        numElements++;
        //check if there are too many children for additional split
        if (children.length > maxChildren) {
            reduceNode(host);
        }
    }

    function optimality() {
        return root.depth() / (Math.log(numElements) / Math.LN2)
    }


    this.threeTraverseFrustum = function (frustum, visitor) {
        "use strict";
        root.traverse(function (node) {
            if (!node.intersectFrustum(frustum)) {
                return false;
            }
            //there is intersection
            var leafValue = node.leafValue;
            if (leafValue !== void 0) {
                visitor(leafValue);
                return false;
            } else {
                return true;
            }
        });
    };
    this.optimality = optimality;
    //
    this.insert = insertElement;
    this.insertMany = function (boxes) {
        root.insertManyBoxes(boxes);
    };
    this.insertManySAH = function (boxes) {
        insertMany(root, boxes);
    };
};
function visualizeBVH(tree, width, height, x, y) {
    var canvas;
    canvas = document.createElement("canvas");
    document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(canvas);
    });
    canvas.width = width;
    canvas.height = height;
    var style = canvas.style;
    style.left = x + "px";
    style.top = y + "px";
    style.position = "absolute";
    drawBVH(canvas.getContext("2d"), tree, width, height);
}

function drawBVH(ctx2d, tree, width, height) {
    var root = tree.root;
    var xScale = width / (root.x1 - root.x0);
    var yScale = height / (root.y1 - root.y0);
    var xOffset = -root.x0;
    var yOffset = -root.y0;
    ctx2d.fillStyle = "rgba(255,0,0,0.2)";
    ctx2d.strokeStyle = "rgba(0,0,0,0.4)";

    function paintNode(n) {
        var _x = n.x0;
        var _w = n.x1 - _x;
        var _y = n.y0;
        var _h = n.y1 - _y;
        //
        var x = (_x + xOffset) * xScale;
        var y = (_y + yOffset) * yScale;
        var w = _w * xScale;
        var h = _h * yScale;
        if (Number.isNaN(w) || Number.isNaN(h)) {
            w = 0;
            h = 0;
            x = 0;
            y = 0;
        }
        if (n.leafValue !== void 0) {
            ctx2d.fillRect(x, y, w, h);
        } else {
            ctx2d.strokeRect(x, y, w, h);
            n.children.forEach(paintNode);
        }
    }

    paintNode(root);
}

var seed = 1;
Math.seedrandom(seed);
function random() {
    return Math.random();
}

