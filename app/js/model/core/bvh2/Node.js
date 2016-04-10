/**
 * Created by Alex on 17/11/2014.
 */
var Box = require('./Box');
var computeMortonCode = require('./Morton');

"use strict";
var Node = function () {
    this.parentNode = void 0;
    this._mortonCode = void 0;
};
Node.prototype = Object.create(Box.prototype);
Node.prototype.setNegativelyInfiniteBounds = function(){
    this.setBounds(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
};
Node.prototype.getMortonCode = function () {
    if (this._mortonCode === void 0) {
        var hx = (this.x1 + this.x0) / 2;
        var hy = (this.y1 + this.y0) / 2;
        var hz = (this.z1 + this.z0) / 2;
        var mortonCode = computeMortonCode(hx, hy, hz);
        this._mortonCode = mortonCode;
        return mortonCode;
    } else {
        return this._mortonCode;
    }
};
/**
 * Expands current node and all ancestors until root to accommodate for given box, terminate if node is already
 * large enough
 * @param box
 */
Node.prototype.bubbleExpandToFit = function (box) {
    var node = this;
    while (node.expandToFit(box)) {
        node = node.parentNode;
        if (node === null || node === void 0) {
            break;
        }
    }
};
module.exports = Node;
