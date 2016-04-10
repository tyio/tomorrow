/**
 * Created by Alex on 31/10/2014.
 */


"use strict";
var maxElements = 12;
var minElements = 1;
var Element = function (obj, x, y) {
    this.x = x;
    this.y = y;
    this.value = obj;
    this.parentNode = void 0;
};
Element.prototype.move = function (x, y) {
    this.x = x;
    this.y = y;
    //check if new position is outside of the parent node
    var parentNode = this.parentNode;
    var node = parentNode;
    while (x <= node.x0 || x > node.x1 || y <= node.y0 || y > node.y1) {
        if (node.parentNode === void 0) {
            //root
            node.resizeToFit(x, y);
            break;
        }
        //outside of the node
        node = node.parentNode;
    }
    //found containing node
    if (node === parentNode) {
        //still inside the parent node
        return;
    }
    parentNode.removeElement(this);
    node.insertElement(this);
};
Element.prototype.remove = function () {
    this.parentNode.removeElement(this);
};
var Quad = function (x0, y0, x1, y1) {
    x0 = x0 !== void 0 ? x0 : 0;
    x1 = x1 !== void 0 ? x1 : 0;
    y0 = y0 !== void 0 ? y0 : 0;
    y1 = y1 !== void 0 ? y1 : 0;
    //
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.parentNode = void 0;
    var hx;
    var hy;

    function setHalfSize(x0, y0, x1, y1) {
        hx = (x1 + x0) / 2;
        hy = (y1 + y0) / 2;
    }

    setHalfSize(x0, y0, x1, y1);


    var elements = [];
    var numElements = 0;
    this.resizeToFit = function (x, y) {
        var _x0 = x0,
            _y0 = y0,
            _x1 = x1,
            _y1 = y1;
        if (x < _x0) {
            _x0 = x;
        } else if (x > _x1) {
            _x1 = x;
        }
        if (y < _y0) {
            _y0 = y;
        } else if (y > _y1) {
            _y1 = y;
        }
        if (x0 !== _x0 || y0 !== _y0 || x1 !== _x1 || y1 !== _y1) {
            this.resize(_x0, _y0, _x1, _y1);
        }
    };
    this.resize = function (_x0, _y0, _x1, _y1) {
        var parentNode = this.parentNode;
        if (parentNode !== void 0) {
            var w = _x1 - _x0;
            var h = _y1 - _y0;
            if (this === parentNode.tl) {
                parentNode.resize(_x0, _y0, _x1 + w, _y1 + h);
            } else if (this === parentNode.tr) {
                parentNode.resize(_x0 - w, _y0, _x1, _y1 + h);
            } else if (this === parentNode.bl) {
                parentNode.resize(_x0, _y0 - h, _x1 + w, _y1);
            } else if (this === parentNode.br) {
                parentNode.resize(_x0 - w, _y0 - h, _x1, _y1);
            } else {
                throw  new Error("Specified 'parent' does not own this node");
            }
            return;
        }
        this.x0 = x0 = _x0;
        this.y0 = y0 = _y0;
        this.x1 = x1 = _x1;
        this.y1 = y1 = _y1;
        setHalfSize(_x0, _y0, _x1, _y1);
        this.merge();
        //reinsert all elements
        var l = numElements;
        var els = elements;
        elements = [];
        numElements = 0;
        for (var i = 0; i < l; i++) {
            this.insertElement(els[i]);
        }
    };
    this.split = function () {
        //generate children
        this.tl = new Quad(x0, y0, hx, hy);
        this.tr = new Quad(hx, y0, x1, hy);
        this.bl = new Quad(x0, hy, hx, y1);
        this.br = new Quad(hx, hy, x1, y1);
        //set parent node
        this.tl.parentNode = this;
        this.tr.parentNode = this;
        this.bl.parentNode = this;
        this.br.parentNode = this;
    };
    this.insert = function (p, x, y) {
        if (x === void 0) {
            x = p.x;
            y = p.y;
        }
        var element = new Element(p, x, y);
        this.resizeToFit(x, y); //adjust size if needed
        this.insertElement(element);
        return element;
    };
    this.insertElement = function (element) {
        if (numElements < maxElements) {
            numElements++;
            elements.push(element);
            element.parentNode = this;
        } else {
            //check for split
            if (this.tl === void 0) {
                this.split();
            }
            //find suitable child to take element
            var x = element.x;
            var y = element.y;
            if (x < hx) {
                if (y < hy) {
                    this.tl.insertElement(element);
                } else {
                    this.bl.insertElement(element);
                }
            } else {
                if (y < hy) {
                    this.tr.insertElement(element);
                } else {
                    this.br.insertElement(element);
                }
            }
        }
    };
    this.bubbleElementsUp = function () {
        var targetNode = this;
        while (numElements > 0 && targetNode.parentNode !== void 0) {
            targetNode = targetNode.parentNode;
            var parentElements = targetNode.numElements;
            var capacityLeft = maxElements - parentElements;
            if (capacityLeft > 0) {
                var transferNumber = Math.min(capacityLeft, numElements);
                for (var i = numElements - transferNumber; i < numElements; i++) {
                    var element = elements[i];
                    targetNode.insertElement(element);
                }
                numElements -= transferNumber;
            }
        }
        elements.length = numElements;
    };
    this.reduce = function () {
        if (this.isLeaf()) {
            //leaf
            this.bubbleElementsUp();
        } else {
            var tl = this.tl;
            var tr = this.tr;
            var bl = this.bl;
            var br = this.br;
            tl.reduce();
            tr.reduce();
            bl.reduce();
            br.reduce();
            //
            if (tl.isLeaf() && tr.isLeaf() && bl.isLeaf() && br.isLeaf()
                && tl.numElements === 0 && tr.numElements === 0 && bl.numElements === 0 && br.numElements === 0) {
                this.tl = void 0;
                this.tr = void 0;
                this.bl = void 0;
                this.br = void 0;
            }
        }
    };
    this.merge = function () {
        //check if split at all
        if (this.isLeaf()) {
            return; //not split
        }
        function absorbElement(element) {
            elements.push(element);
            numElements++;
        }

        //merge children
        this.tl.traverse(absorbElement);
        this.tr.traverse(absorbElement);
        this.bl.traverse(absorbElement);
        this.br.traverse(absorbElement);
        //
        this.tl = void 0;
        this.tr = void 0;
        this.bl = void 0;
        this.br = void 0;
    };
    this.removeElement = function (e) {
        var i = elements.indexOf(e);
        elements.splice(i, 1);
        numElements--;
        if (numElements < minElements) {
            this.reduce();
        }
    };
    this.traversePreOrder = function (visitor) {
        var keepGoing = visitor(this);
        if (keepGoing !== false && this.tl !== void 0) {
            this.tl.traversePreOrder(visitor);
            this.tr.traversePreOrder(visitor);
            this.bl.traversePreOrder(visitor);
            this.br.traversePreOrder(visitor);
        }
    };
    this.traverse = function (visitor) {
        elements.forEach(visitor);
        if (this.tl !== void 0) {
            this.tl.traverse(visitor);
            this.tr.traverse(visitor);
            this.bl.traverse(visitor);
            this.br.traverse(visitor);
        }
    };
    this.traverseCircle = function (cX, cY, r, visitor) {
        this.traverseCircleSqr(cX, cY, r * r, visitor);
    };
    this.traverseCircleSqr = function (cX, cY, r2, visitor) {
        for (var i = 0; i < numElements; i++) {
            var element = elements[i];
            var x = element.x;
            var y = element.y;
            var dx = cX - x;
            var dy = cY - y;
            var d2 = dx * dx + dy * dy;
            if (d2 < r2) {
                visitor(element);
            }
        }
        if (cX - r < hx) {
            if (cY - r < hy) {
                this.tl.traverseCircleSqr(cX, cY, r2, visitor);
            }
            if (cY + r >= hy) {
                this.bl.traverseCircleSqr(cX, cY, r2, visitor);
            }
        }
        if (cX + r >= hx) {
            if (cY - r < hy) {
                this.tr.traverseCircleSqr(cX, cY, r2, visitor);
            }
            if (cY + r >= hy) {
                this.br.traverseCircleSqr(cX, cY, r2, visitor);
            }
        }
    };
    this.traverseRect = function (_x0, _y0, _x1, _y1, visitor) {
        //check elements
        for (var i = 0; i < numElements; i++) {
            var element = elements[i];
            var x = element.x;
            var y = element.y;
            if (x > _x0 && x < _x1 && y > _y0 && y < _y1) {
                visitor(element);
            }
        }
        if (!this.isLeaf()) {
            //if we have children - check them
            if (_x0 <= hx) {
                if (_y0 <= hy) {
                    this.tl.traverseRect(_x0, _y0, _x1, _y1, visitor);
                }
                if (_y1 >= hy) {
                    this.bl.traverseRect(_x0, _y0, _x1, _y1, visitor);
                }
            }
            if (_x1 >= hx) {
                if (_y0 <= hy) {
                    this.tr.traverseRect(_x0, _y0, _x1, _y1, visitor);
                }
                if (_y1 >= hy) {
                    this.br.traverseRect(_x0, _y0, _x1, _y1, visitor);
                }
            }
        }
    };
    this.validateNode = function () {
        if (hx !== (this.x0 + this.x1) / 2) {
            return false;
        }
        if (hy !== (this.y0 + this.y1) / 2) {
            return false;
        }
        if (!this.isLeaf()) {
            if (this.tl.parentNode !== this
                || this.tr.parentNode !== this
                || this.bl.parentNode !== this
                || this.br.parentNode !== this) {
                return false;
            }
            if (this.tl.x0 !== this.x0 || this.tl.x1 !== hx || this.tl.y0 !== this.y0 || this.tl.y1 !== hy) {
                return false;
            }
            if (this.tr.x0 !== hx || this.tr.x1 !== this.x1 || this.tr.y0 !== this.y0 || this.tr.y1 !== hy) {
                return false;
            }
            if (this.bl.x0 !== this.x0 || this.bl.x1 !== hx || this.bl.y0 !== hy || this.bl.y1 !== this.y1) {
                return false;
            }
            if (this.br.x0 !== hx || this.br.x1 !== this.x1 || this.br.y0 !== hy || this.br.y1 !== this.y1) {
                return false;
            }
        } else if (this.elements !== void 0) {
            //check containment of elements
            for (var i = 0; i < this.elements.length; i++) {
                var e = elements[i];
                if (e.x < this.x0 || e.x > this.x1 || e.y < this.y0 || e.y > this.y1) {
                    return false;
                }
            }
        }
        return true;
    };
    this.validate = function () {
        var v = true;
        this.traversePreOrder(function (node) {
            var isValid = node.validateNode();
            if (!isValid && v !== false) {
                v = false;
            }
            return isValid;
        });
        return v;
    };
    this.isLeaf = function () {
        return this.tl === void 0;
    };
    Object.defineProperties(this, {
        numElements: {
            get: function () {
                return numElements;
            }
        }
    });
    this.tl = void 0;
    this.tr = void 0;
    this.bl = void 0;
    this.br = void 0;
};
module.exports = Quad;
;