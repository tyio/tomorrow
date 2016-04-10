/**
 * Created by Alex on 18/03/14.
 */
var Vector3 = require("Vector3");

function clamp(val, min, max) {
    "use strict";
    if (val > max) {
        return max;
    }
    if (val < min) {
        return min;
    }
    return val;
}

var SMALL_NUM = 1e-9;
/**
 * @param {Vector3} first
 * @param {Vector3} second
 * @constructor
 */
var LineSegment = function (first, second) {
    this.p0 = first || null;
    this.p1 = second || null;

};
LineSegment.prototype.closestPointToPointParameter = function (point, clampToLine) {


    var startP = point.clone().sub(this.p0);
    var startEnd = this.p1.clone().sub(this.p0);

    var startEnd2 = startEnd.dot(startEnd);
    var startEnd_startP = startEnd.dot(startP);

    var t = startEnd_startP / startEnd2;

    if (clampToLine) {

        t = clamp(t, 0, 1);

    }

    return t;

};

LineSegment.prototype.closestPointToPoint = function (point) {

    var t = this.closestPointToPointParameter(point, true);

    var result = this.p1.clone().sub(this.p0);
    return result.scale(t).add(this.p0);

};
/**
 * @param {Vector3} p
 * @returns {number}
 */
LineSegment.prototype.distanceToPoint = function (p) {
    var closestPointToPoint = this.closestPointToPoint(p);
    return closestPointToPoint.sub(p).length();
};
/**
 * @param {LineSegment} other
 * @returns {number}
 */
LineSegment.prototype.distanceToSegment = function (other) {
    var u = this.p1.clone().sub(this.p0);
    var v = other.p1.clone().sub(other.p0);
    var w = this.p0.clone().sub(other.p0);
    var a = u.dot(u);         // always >= 0
    var b = u.dot(v);
    var c = v.dot(v);         // always >= 0
    var d = u.dot(w);
    var e = v.dot(w);
    var D = a * c - b * b;        // always >= 0
    var sc, sN, sD = D;       // sc = sN / sD, default sD = D >= 0
    var tc, tN, tD = D;       // tc = tN / tD, default tD = D >= 0

    // compute the line parameters of the two closest points
    if (D < SMALL_NUM) { // the lines are almost parallel
        sN = 0.0;         // force using point P0 on segment S1
        sD = 1.0;         // to prevent possible division by 0.0 later
        tN = e;
        tD = c;
    }
    else {                 // get the closest points on the infinite lines
        sN = (b * e - c * d);
        tN = (a * e - b * d);
        if (sN < 0.0) {        // sc < 0 => the s=0 edge is visible
            sN = 0.0;
            tN = e;
            tD = c;
        }
        else if (sN > sD) {  // sc > 1  => the s=1 edge is visible
            sN = sD;
            tN = e + b;
            tD = c;
        }
    }

    if (tN < 0.0) {            // tc < 0 => the t=0 edge is visible
        tN = 0.0;
        // recompute sc for this edge
        if (-d < 0.0)
            sN = 0.0;
        else if (-d > a)
            sN = sD;
        else {
            sN = -d;
            sD = a;
        }
    }
    else if (tN > tD) {      // tc > 1  => the t=1 edge is visible
        tN = tD;
        // recompute sc for this edge
        if ((-d + b) < 0.0)
            sN = 0;
        else if ((-d + b) > a)
            sN = sD;
        else {
            sN = (-d + b);
            sD = a;
        }
    }
    // finally do the division to get sc and tc
    sc = (Math.abs(sN) < SMALL_NUM ? 0.0 : sN / sD);
    tc = (Math.abs(tN) < SMALL_NUM ? 0.0 : tN / tD);

    // get the difference of the two closest points
    var dP = w.clone().add(
        u.clone().scale(sc).sub(
            v.clone().scale(tc)
        )
    );  // =  S1(sc) - S2(tc)

    return dP.length();   // return the closest distance
};
LineSegment.prototype.clone = function () {
    return new LineSegment(this.p0, this.p1);
};
LineSegment.prototype.midPoint = function () {
    return this.p1.lerp(this.p0, 0.5);
};
LineSegment.prototype.shrinkByScalar = function (scalar) {
    var length = this.length();
    var newScale = (length - scalar) / length;
    var halfScaleDelta = (1 - newScale) / 2;
    //find mid point
    var midPoint = this.midPoint();
    //pull edges towards the midpoint
    var newP0 = this.p0.clone().lerp(this.p1, halfScaleDelta);
    var newP1 = this.p1.clone().lerp(this.p0, halfScaleDelta);
    this.p0 = newP0;
    this.p1 = newP1;
    //new length should now be equal to oldLength - scalar;
    return this;
};
LineSegment.prototype.length = function () {
    return this.p0.distanceTo(this.p1);
};
LineSegment.prototype.translate = function (vector) {
    this.p0.add(vector);
    this.p1.add(vector);
};
LineSegment.intersectionPoint = (function () {
    var cross_da_db = new Vector3();
    var cross_dc_db = new Vector3();
    var dc = new Vector3();
    var da = new Vector3();
    var db = new Vector3();

    /**
     *
     * @param {Vector3} a0
     * @param {Vector3} a1
     * @param {Vector3} b0
     * @param {Vector3} b1
     * @param {Vector3} result
     * @returns {boolean}
     */
    function intersectionPoint(a0, a1, b0, b1, result) {
        da.copy(a1).sub(a0);
        db.copy(b1).sub(b0);
        dc.copy(b0).sub(a0);

        cross_da_db.copy(da).cross(db);
        if (dc.dot(cross_da_db) != 0.0) {
            // lines are not coplanar
            return false;
        }

        cross_dc_db.copy(dc).cross(db);
        var s = cross_dc_db.dot(cross_da_db) / cross_da_db.lengthSqr();
        result.copy(da).multiplyScalar(s).add(a0);
        if (s >= 0.0 && s <= 1.0) {
            return true;
        }

        return false;
    }

    return intersectionPoint;
})();
module.exports = LineSegment;
