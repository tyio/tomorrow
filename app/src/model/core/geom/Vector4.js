/**
 * Created by Alex on 29/12/2015.
 */

/**
 *
 * @param {Number} [x=0]
 * @param {Number} [y=0]
 * @param {Number} [z=0]
 * @param {Number} [w=0]
 * @constructor
 */
var Vector4 = function Vector4(x, y, z, w) {
    this.x = x !== undefined ? x : 0;
    this.y = y !== undefined ? y : 0;
    this.z = z !== undefined ? z : 0;
    this.w = w !== undefined ? w : 0;
};

Vector4.prototype.set = function (x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
};

Vector4.prototype.copy = function (vec4) {
    this.set(vec4.x, vec4.y, vec4.z, vec4.w);
};

Vector4.prototype.equals = function (vec4) {
    return this.x === vec4.x && this.y === vec4.y && this.z === vec4.z && this.w === vec4.w;
};

module.exports = Vector4;
