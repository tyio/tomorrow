var Signal = require("./../Signal");
"use strict";
var Vector3 = function (x, y, z) {
    this.x = x !== void 0 ? x : 0;
    this.y = y !== void 0 ? y : 0;
    this.z = z !== void 0 ? z : 0;
    this.onChanged = new Signal();
};
Vector3.prototype.set = function (x, y, z) {
    var oldX = this.x;
    var oldY = this.y;
    var oldZ = this.z;
    if (x !== oldX || y !== oldY || z !== oldZ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.onChanged.dispatch(x, y, z, oldX, oldY, oldZ);
    }
    return this;
};
Vector3.prototype.add = function (other) {
    return this._add(other.x, other.y, other.z);
};
Vector3.prototype._add = function (x, y, z) {
    return this.set(this.x + x, this.y + y, this.z + z);
};
Vector3.prototype.sub = function (other) {
    return this._sub(other.x, other.y, other.z);
};
Vector3.prototype._sub = function (x, y, z) {
    return this.set(this.x - x, this.y - y, this.z - z);
};
Vector3.prototype.subScalar = function (val) {
    return this.set(this.x - val, this.y - val, this.z - val);
};
Vector3.prototype.addScalar = function (val) {
    return this.set(this.x + val, this.y + val, this.z + val);
};
Vector3.prototype.clone = function () {
    return new Vector3(this.x, this.y, this.z);
};
Vector3.prototype.multiplyScalar = function (val) {
    return this.set(this.x * val, this.y * val, this.z * val);
};
Vector3.prototype.isZero = function () {
    return this.x === 0 && this.y === 0 && this.z === 0;
};
Vector3.prototype.cross = function (other) {
    var ax = this.x, ay = this.y, az = this.z;
    var bx = other.x, by = other.y, bz = other.z;

    var x = ay * bz - az * by;
    var y = az * bx - ax * bz;
    var z = ax * by - ay * bx;
    return this.set(x, y, z);
};
Vector3.prototype.dot = function (v) {
    return (this.x * v.x + this.y * v.y + this.z * v.z);
};
function v3Length(v) {
    return v3Length_i(v.x, v.y, v.z);
}
function v3Length_i(x, y, z) {
    return Math.sqrt(v3LengthSqr_i(x, y, z));
}
function v3LengthSqr_i(x, y, z) {
    return x * x + y * y + z * z;
}
Vector3.prototype.length = function () {
    return v3Length(this);
};
Vector3.prototype.lengthSqr = function () {
    return v3LengthSqr_i(this.x, this.y, this.z);
};
Vector3.prototype.normalize = function () {
    var l = this.length();
    return this.set(this.x / l, this.y / l, this.z / l);
};
Vector3.prototype.copy = function (other) {
    return this.set(other.x, other.y, other.z);
};
Vector3.prototype.distanceTo = function (other) {
    return Math.sqrt(this.distanceToSquared(other));
};
Vector3.prototype.distanceSqrTo = Vector3.prototype.distanceToSquared = function (other) {
    return v3LengthSqr_i(this.x - other.x, this.y - other.y, this.z - other.z);
};
Vector3.prototype.angleTo = function (other) {
    return Math.acos(this.dot(other) / (v3Length(this) * v3Length(other)));
};
Vector3.prototype.equals = function (other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
};
Vector3.prototype.toJSON = function () {
    return {x: this.x, y: this.y, z: this.z};
};
module.exports = Vector3;
