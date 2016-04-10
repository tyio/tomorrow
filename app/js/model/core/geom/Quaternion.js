/**
 * Created by Alex on 10/03/14.
 */


"use strict";

var Vector3 = require('./Vector3');

var Quaternion = function (x, y, z, w) {
    this.x = (x != void 0) ? x : 0;
    this.y = (x !== void 0) ? y : 0;
    this.z = (z !== void 0) ? z : 0;
    this.w = (w !== void 0) ? w : 1;
};

Quaternion.prototype.lookRotation = (function () {
    // just in case you need that function also
    function CreateFromAxisAngle(axis, angle, result) {
        var halfAngle = angle * .5;
        var s = Math.sin(halfAngle);
        return result.set(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle));
    }

    var __forwardVector = new Vector3(0, 0, 1);
    var __upVector = new Vector3(0, 1, 0);
    var rotAxis = new Vector3();

    function lookAt(forwardVector) {
        var dot = __forwardVector.dot(forwardVector);
        if (Math.abs(dot - (-1.0)) < 0.000001) {
            return this.set(__upVector.x, __upVector.y, __upVector.z, 3.1415926535897932);
        }
        if (Math.abs(dot - (1.0)) < 0.000001) {
            return this.set(0, 0, 0, 1);
        }

        var rotAngle = Math.acos(dot);
        rotAxis.copy(__forwardVector);
        rotAxis.cross(forwardVector);
        rotAxis.normalize();
        return CreateFromAxisAngle(rotAxis, rotAngle, this);
    }

    return lookAt;
})();
Quaternion.prototype.normalize = function () {
    var l = this.length();

    if (l === 0) {
        this.set(0, 0, 0, 1);
    } else {
        l = 1 / l;
        this.multiplyScalar(l, l, l, l);
    }
};
Quaternion.prototype.multiplyScalar = function (val) {
    return this.set(this.x * val, this.y * val, this.z * val, this.w * val);
};
Quaternion.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
};
Quaternion.prototype.copy = function (other) {
    return this.set(other.x, other.y, other.z, other.w);
};

Quaternion.prototype.set = function (x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
};

module.exports = Quaternion;