/**
 * Created by Alex on 29/01/14.
 */


"use strict";
var Edge = function (a, b) {
    this.first = a;
    this.second = b;
    //undirected by default
    this.directionForward = true;
    this.directionBackward = true;
};
Edge.prototype.contains = function (node) {
    return this.first == node || this.second == node;
};

Edge.prototype.validateTransition = function ( source, target ) {
    var a = this.first;
    var b = this.second;
    return (a === source && b === target && this.directionForward) || (b === source && a === target && this.directionBackward);
};

/**
 * Provided one of the associated nodes - returns the other one, if supplied node is not connecting the edge - returns first node (unintended behaviour)
 * @param {*} node
 * @returns {second|first}
 */
Edge.prototype.other = function (node) {
    return (node == this.first) ? this.second : this.first;
};
Edge.prototype.__defineGetter__("nodes", function () {
    return [this.first, this.second];
});
Edge.prototype.__defineGetter__("length", function () {
    return this.first.distanceTo(this.second);
});
Edge.prototype.angle = function () {
    var delta = this.second.clone().sub(this.first);
    return Math.atan2(delta.y , delta.x);
};
Edge.prototype.closestPointToPoint = function (point) {
    var start = new THREE.Vector3(this.first.x || 0, this.first.y || 0, this.first.z || 0);
    var end = new THREE.Vector3(this.second.x || 0, this.second.y || 0, this.second.z || 0);
    var line3 = new THREE.Line3(start, end);
    var v3 = new THREE.Vector3(point.x || 0, point.y || 0, point.z || 0);
    return line3.closestPointToPoint(v3, true);
};
module.exports = Edge;
