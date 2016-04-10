/**
 * Created by Alex on 17/11/2014.
 */
var Node = require('./Node');

"use strict";
var LeafNode = function (object) {
    this.object = object;
};

LeafNode.prototype = Object.create(Node.prototype);

LeafNode.prototype.move = function (dx, dy, dz) {
    //this.x0 = this.x0 +dx;
    //this.x1 = this.x1 +dx;
    //this.y0 = this.y0 +dy;
    //this.y1 = this.y1 +dy;
    //this.z0 = this.z0 +dz;
    //this.z1 = this.z1 +dz;
    //
    this.x0 += dx;
    this.x1 += dx;
    this.y0 += dy;
    this.y1 += dy;
    this.z0 += dz;
    this.z1 += dz;
    this.parentNode.bubbleRefit();
};

LeafNode.prototype.resize = function(x0,y0,z0,x1,y1,z1){
    this.setBounds(x0,y0,z0,x1,y1,z1);
    this.parentNode.bubbleRefit();
};

LeafNode.prototype.remove = function () {
    var node = this.parentNode;
    if (this === node.a) {
        node.a = void 0;
    } else if (this === node.b) {
        node.b = void 0;
    } else {
        throw new Error("impostor child");
    }
};

module.exports = LeafNode;
