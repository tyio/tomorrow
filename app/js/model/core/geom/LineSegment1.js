/**
 * Created by Alex on 03/07/2016.
 */
"use strict";

function LineSegment1(p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
}

LineSegment1.prototype.set = function (p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
};

/**
 * Sets result to cover overlap between this segment and other if such overlap exists.
 * @param {LineSegment1} other
 * @param {LineSegment1} result
 * @returns {boolean}
 */
LineSegment1.prototype.computeIntersection = function (other, result) {
    if (this.p0 < other.p0 && this.p1 > other.p0) {
        result.p0 = other.p0;
        result.p1 = Math.min(this.p1, other.p1);
        return true;
    } else if (this.p0 > other.p0 && this.p0 < other.p1) {
        result.p0 = this.p0;
        result.p1 = Math.min(this.p1, other.p1);
        return true;
    } else {
        //no overlap
        return false;
    }
};

module.exports = LineSegment1;