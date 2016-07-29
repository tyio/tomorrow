/**
 * Created by Alex on 14/02/14.
 */
var Signal = require('./../Signal');

"use strict";
var Vector2 = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.onChanged = new Signal();
};
Vector2.prototype.set = function (x, y) {
    this.x = x;
    this.y = y;
    this.onChanged.dispatch(x, y);
    return this;
};
Vector2.prototype._sub = function (x, y) {
    return this.set(this.x - x, this.y - y);
};
Vector2.prototype.sub = function (other) {
    return this._sub(other.x, other.y);
};
Vector2.prototype.floor = function () {
    return this.set(Math.floor(this.x), Math.floor(this.y));
};
Vector2.prototype._mod = function (x, y) {
    return this.set(this.x % x, this.y % y);
};
Vector2.prototype.mod = function (other) {
    return this._mod(other.x, other.y);
};
Vector2.prototype.divide = function (other) {
    return this.set(this.x / other.x, this.y / other.y);
};
Vector2.prototype.multiply = function (other) {
    return this.set(this.x * other.x, this.y * other.y);
};
Vector2.prototype.copy = function (other) {
    return this.set(other.x, other.y);
};
Vector2.prototype.clone = function () {
    return new Vector2(this.x, this.y);
};
Vector2.prototype._add = function (x, y) {
    return this.set(this.x + x, this.y + y);
};
Vector2.prototype.add = function (other) {
    return this._add(other.x, other.y);
};
/**
 *
 * @param {Number} val
 */
Vector2.prototype.addScalar = function (val) {
    return this._add(val, val);
};
/**
 *
 * @param {Number} val
 */
Vector2.prototype.multiplyScalar = function (val) {
    return this.set(this.x * val, this.y * val);
};
Vector2.prototype.toJSON = function () {
    return {x: this.x, y: this.y};
};
function clamp(value, min, max) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

/**
 *
 * @param {Number} minX
 * @param {Number} minY
 * @param {Number} maxX
 * @param {Number} maxY
 */
Vector2.prototype.clamp = function (minX, minY, maxX, maxY) {
    var x = clamp(this.x, minX, maxX);
    var y = clamp(this.y, minY, maxY);
    return this.set(x, y);
};
/**
 *
 * @param {Number} lowX
 * @param {Number} lowY
 */
Vector2.prototype.clampLow = function (lowX, lowY) {
    var x = Math.max(this.x, lowX);
    var y = Math.max(this.y, lowY);
    return this.set(x, y);
};

/**
 *
 * @param {Number} highX
 * @param {Number} highY
 */
Vector2.prototype.clampHigh = function (highX, highY) {
    var x = Math.max(this.x, highX);
    var y = Math.max(this.y, highY);
    return this.set(x, y);
};
/**
 *
 * @param {Vector2} other
 */
Vector2.prototype.distanceSqrTo = function (other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    return dx * dx + dy * dy;
};

Vector2.prototype.hashCode = function () {
    var x = this.x;
    var y = this.y;
    var hash = ((x << 5) - x) + y;
    hash |= 0; //convert to 32bit int
    return hash;
};

Vector2.prototype.equals = function (other) {
    return this.x === other.x && this.y === other.y;
};

Vector2.prototype.react = function (f) {
    f(this.x, this.y);
    this.onChanged.add(f);
};

module.exports = Vector2;
