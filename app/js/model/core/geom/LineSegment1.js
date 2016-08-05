/**
 * Created by Alex on 03/07/2016.
 */
"use strict";

/**
 *
 * @param {Number} p0
 * @param {Number} p1
 * @constructor
 */
function LineSegment1(p0, p1) {
    /**
     *
     * @type {Number}
     */
    this.p0 = p0;
    /**
     *
     * @type {Number}
     */
    this.p1 = p1;
}

/**
 *
 * @param {Number} p0
 * @param {Number} p1
 * @returns {LineSegment1}
 */
LineSegment1.prototype.set = function (p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
    return this;
};

/**
 *
 * @param {LineSegment1} other
 * @returns {LineSegment1}
 */
LineSegment1.prototype.copy = function (other) {
    return this.set(other.p0, other.p1);
};

/**
 *
 * @returns {LineSegment1}
 */
LineSegment1.prototype.clone = function () {
    return new LineSegment1(this.p0, this.p1);
};

/**
 *
 * @returns {number}
 */
LineSegment1.prototype.length = function () {
    return this.p1 - this.p0;
};

/**
 *
 * @param {LineSegment1} other
 * @returns {LineSegment1}
 */
LineSegment1.prototype.expandToFit = function (other) {
    var p0 = Math.min(this.p0, other.p0);
    var p1 = Math.max(this.p1, other.p1);
    return this.set(p0, p1);
};

/**
 * Sets result to cover overlap between this segment and other if such overlap exists. Overlap includes touching
 * @param {LineSegment1} other
 * @param {LineSegment1} result
 * @returns {boolean}
 */
LineSegment1.prototype.computeIntersection = function (other, result) {
    if (this.p0 <= other.p0 && this.p1 >= other.p0) {
        result.p0 = other.p0;
        result.p1 = Math.min(this.p1, other.p1);
        return true;
    } else if (this.p0 >= other.p0 && this.p0 <= other.p1) {
        result.p0 = this.p0;
        result.p1 = Math.min(this.p1, other.p1);
        return true;
    } else {
        //no overlap
        return false;
    }
};

LineSegment1.prototype.intersects = (function () {
    var t = new LineSegment1();

    function intersects(other) {
        return this.computeIntersection(other, t);
    }

    return intersects;
})();
/**
 *
 * @param {LineSegment1} a
 * @param {LineSegment1} b
 * @returns {number}
 */
LineSegment1.COMPARE_BY_P0 = function (a, b) {
    return a.p0 - b.p0;
};

function SegmentGroup() {
    LineSegment1.call(this, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.members = [];
}

SegmentGroup.prototype = Object.create(LineSegment1.prototype);

SegmentGroup.prototype.set = function (p0, p1) {
    var oldP0 = this.p0;
    var result = LineSegment1.prototype.set.call(this, p0, p1);
    //propagate p0 difference to children
    var deltaP0 = p0 - oldP0;
    if (deltaP0 !== 0) {
        this.members.forEach(function (m) {
            m.set(m.p0 + deltaP0, m.p1 + deltaP0);
        });
    }
    return result;
};

SegmentGroup.prototype.resolveMemberOverlap = function () {
    //compute total space required
    var members = this.members;
    var spaceRequired = 0;
    var i, member;
    var numMembers = members.length;
    for (i = 0; i < numMembers; i++) {
        member = members[i];
        spaceRequired += member.length();
    }
    var spaceDeficit = spaceRequired - this.length();
    //compute new bounds
    var newP0 = this.p0 - spaceDeficit / 2;
    var newP1 = newP0 + spaceRequired;

    this.p0 = newP0;
    this.p1 = newP1;

    //sort members by p0
    members.sort(LineSegment1.COMPARE_BY_P0);

    var offset = newP0;
    //set new positions for members
    for (i = 0; i < numMembers; i++) {
        member = members[i];
        var memberLength = member.length();
        member.set(offset, offset + memberLength);
        offset += memberLength;
    }
};

/**
 *
 * @param {Array.<LineSegment1>} segments
 * @returns {Array.<SegmentGroup>}
 */
LineSegment1.groupByOverlap = function (segments) {

    function computeGroups(segments) {
        var groups = [];

        function consumeGroupSegments(group, segments) {
            var numSegments = segments.length;
            var doConsumeLoop = true;

            var tempSegment = new LineSegment1();

            while (doConsumeLoop && numSegments > 0) {
                doConsumeLoop = false;
                for (var i = 0; i < numSegments; i++) {
                    var segment = segments[i];
                    if (segment.computeIntersection(group, tempSegment)) {
                        group.members.push(segment);
                        group.expandToFit(segment);
                        segments.splice(i, 1);
                        //handle iteration counter
                        i--;
                        //update number of segments left unmatched
                        numSegments--;
                        doConsumeLoop = true;
                    }
                }
            }
        }

        while (segments.length > 0) {
            var group = new SegmentGroup();
            groups.push(group);

            var segment = segments.shift();

            group.copy(segment);
            group.members.push(segment);

            consumeGroupSegments(group, segments);
        }

        return groups;
    }

    return computeGroups(segments.slice());
};

LineSegment1.enforceLimits = function (segment, limits) {
    var limitsLength = limits.length();
    var groupLength = segment.length();
    //enforce limits
    if (groupLength <= limitsLength) {
        if (segment.p0 < limits.p0) {
            segment.set(limits.p0, limits.p0 + groupLength);
        } else if (segment.p1 > limits.p1) {
            segment.set(limits.p1 - groupLength, limits.p1);
        }
    } else {
        //limits are not enforceable, segment is too large to fit
    }
};
/**
 *
 * @param {Array.<LineSegment1>} segments
 * @param {function} visitor
 */
LineSegment1.traverseAllPairs = function (segments, visitor) {
    var numSegments = segments.length;
    for (var i = 0; i < numSegments; i++) {
        var first = segments[i];
        for (var j = i + 1; j < numSegments; j++) {
            var second = segments[j];
            var keepGoing = visitor(first, second);
            if (keepGoing === false) {
                return;
            }
        }
    }
};
/**
 *
 * @param {Array.<LineSegment1>} segments collection of segments to be resolved for
 * @param {LineSegment1} limits limits that resolved segments must fall into
 */
LineSegment1.resolveOverlap = function (segments, limits) {
    var segmentGroups = LineSegment1.groupByOverlap(segments);

    segmentGroups.forEach(function (g) {
        g.resolveMemberOverlap();
        LineSegment1.enforceLimits(g, limits);
    });

    //resolve overlap between groups
    if (segmentGroups.length > 1) {
        var totalSpaceRequired = segmentGroups.reduce(function (sum, element) {
            return sum + element.length();
        }, 0);
        var groupsFitInLimit = totalSpaceRequired < limits.length();
        if (groupsFitInLimit) {
            var needAnotherRecursion = false;
            LineSegment1.traverseAllPairs(segmentGroups, function (g0, g1) {
                if (g0.intersects(g1)) {
                    needAnotherRecursion = true;
                    return false;
                }
            });
            if (needAnotherRecursion) {
                LineSegment1.resolveOverlap(segmentGroups, limits);
            }
        }
    }
};

module.exports = LineSegment1;