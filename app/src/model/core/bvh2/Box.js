/**
 * Created by Alex on 16/11/2014.
 */


"use strict";
var THREE = require("THREE");
var computeMortonCode = require("./Morton");
function scoreBoxesSAH(b0, b1) {
    var x0, y0, z0, x1, y1, z1;
    //
    var b0x0 = b0.x0;
    var b0y0 = b0.y0;
    var b0z0 = b0.z0;
    var b0x1 = b0.x1;
    var b0y1 = b0.y1;
    var b0z1 = b0.z1;
    var b1x0 = b1.x0;
    var b1y0 = b1.y0;
    var b1z0 = b1.z0;
    var b1x1 = b1.x1;
    var b1y1 = b1.y1;
    var b1z1 = b1.z1;
    //
    x0 = b0x0 < b1x0 ? b0x0 : b1x0;
    y0 = b0y0 < b1y0 ? b0y0 : b1y0;
    z0 = b0z0 < b1z0 ? b0z0 : b1z0;
    x1 = b0x1 > b1x1 ? b0x1 : b1x1;
    y1 = b0y1 > b1y1 ? b0y1 : b1y1;
    z1 = b0z1 > b1z1 ? b0z1 : b1z1;
    //
    var totalArea = boxSurfaceArea(x0, y0, z0, x1, y1, z1);
    return totalArea;
}

function scoreBoxesSAHDelta(b0, b1) {
    var x0, y0, z0, x1, y1, z1;
    //
    var b0x0 = b0.x0;
    var b0y0 = b0.y0;
    var b0z0 = b0.z0;
    var b0x1 = b0.x1;
    var b0y1 = b0.y1;
    var b0z1 = b0.z1;
    var b1x0 = b1.x0;
    var b1y0 = b1.y0;
    var b1z0 = b1.z0;
    var b1x1 = b1.x1;
    var b1y1 = b1.y1;
    var b1z1 = b1.z1;
    //
    x0 = b0x0 < b1x0 ? b0x0 : b1x0;
    y0 = b0y0 < b1y0 ? b0y0 : b1y0;
    z0 = b0z0 < b1z0 ? b0z0 : b1z0;
    x1 = b0x1 > b1x1 ? b0x1 : b1x1;
    y1 = b0y1 > b1y1 ? b0y1 : b1y1;
    z1 = b0z1 > b1z1 ? b0z1 : b1z1;
    //
    var totalArea = boxSurfaceArea2(x0, y0, z0, x1, y1, z1);
    var area0 = b0.getSurfaceArea();
    var area1 = b1.getSurfaceArea();
    return totalArea - Math.max(area0, area1);
}

function scoreBoxesDistance(b0, b1) {
    return b0.distanceToBox(b1);
}

function boxSurfaceArea(x0, y0, z0, x1, y1, z1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var dz = z1 - z0;
    return (dx * dy + dy * dz + dz * dx) * 2; //2 of each side
}

function boxSurfaceArea2(x0, y0, z0, x1, y1, z1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var dz = z1 - z0;
    return dy * (dx + dz) + dz * dx; //1 side, since it's a heuristic only
}

var Box = function (x0, y0, z0, x1, y1, z1) {
    this.setBounds(x0, y0, z0, x1, y1, z1);
    this._surfaceArea = -1;
};
Box.prototype.computeMortonCode = function () {
    "use strict";
    var cx = (this.x0 + this.x1) >> 1;
    var cy = (this.y0 + this.y1) >> 1;
    var cz = (this.z0 + this.z1) >> 1;
    return computeMortonCode(cx, cy, cz);
};
Box.prototype.computeSurfaceArea = function () {
    this._surfaceArea = boxSurfaceArea2(this.x0, this.y0, this.z0, this.x1, this.y1, this.z1);
};
Box.prototype.getSurfaceArea = function () {
    if (this._surfaceArea < 0) {
        this.computeSurfaceArea();
    }
    return this._surfaceArea;
};
Box.prototype.copy = function (other) {
    this.setBounds(other.x0, other.y0, other.z0, other.x1, other.y1, other.z1);
};
Box.prototype.setBounds = function (x0, y0, z0, x1, y1, z1) {
    this.x0 = x0;
    this.y0 = y0;
    this.z0 = z0;
    this.x1 = x1;
    this.y1 = y1;
    this.z1 = z1;
};
Box.prototype.distanceToBox = function (box) {
    return this._distanceToBox(box.x0, box.y0, box.z0, box.x1, box.y1, box.z1);
};
Box.prototype._distanceToBox = function (x0, y0, z0, x1, y1, z1) {
    var _x0 = this.x0;
    var _y0 = this.y0;
    var _z0 = this.z0;
    var _x1 = this.x1;
    var _y1 = this.y1;
    var _z1 = this.z1;
    //do projection
    var xp0 = _x0 - x1;
    var xp1 = x0 - _x1;
    var yp0 = _y0 - y1;
    var yp1 = y0 - _y1;
    var zp0 = _z0 - z1;
    var zp1 = z0 - _z1;
    //calculate separation in each axis
    var dx = Math.max(xp0, xp1);
    var dy = Math.max(yp0, yp1);
    var dz = Math.max(zp0, zp1);
    //straight-line distance
    var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dx < 0 && dy < 0 && dz < 0) {
        //penetration
        return -distance;
    } else {
        return distance;
    }
};
Box.prototype.costForInclusion = function (other) {
    return this._costForInclusion(other.x0, other.y0, other.z0, other.x1, other.y1, other.z1);
};
Box.prototype._costForInclusion = function (x0, y0, z0, x1, y1, z1) {
    var x = 0;
    var y = 0;
    var z = 0;
    //
    var _x0 = this.x0;
    var _y0 = this.y0;
    var _z0 = this.z0;
    var _x1 = this.x1;
    var _y1 = this.y1;
    var _z1 = this.z1;
    //
    if (_x0 > x0) {
        x += _x0 - x0;
    }
    if (_x1 < x1) {
        x += x1 - _x1;
    }
    if (_y0 > y0) {
        y += _y0 - y0;
    }
    if (_y1 < y1) {
        y += y1 - _y1;
    }
    if (_z0 > z0) {
        z += _z0 - z0;
    }
    if (_z1 < z1) {
        z += z1 - _z1;
    }
    return 2 * (x * y + y * z + z * x);
};
Box.prototype.expandToFit = function (box) {
    return this._expandToFit(box.x0, box.y0, box.z0, box.x1, box.y1, box.z1);
};
Box.prototype._expandToFit = function (x0, y0, z0, x1, y1, z1) {
    var expanded = false;
    if (x0 < this.x0) {
        this.x0 = x0;
        expanded = true;
    }
    if (y0 < this.y0) {
        this.y0 = y0;
        expanded = true;
    }
    if (z0 < this.z0) {
        this.z0 = z0;
        expanded = true;
    }
    if (x1 > this.x1) {
        this.x1 = x1;
        expanded = true;
    }
    if (y1 > this.y1) {
        this.y1 = y1;
        expanded = true;
    }
    if (z1 > this.z1) {
        this.z1 = z1;
        expanded = true;
    }
    return expanded;
};
Box.prototype._containsBox = function (x0, y0, z0, x1, y1, z1) {
    return x0 >= this.x0 && y0 >= this.y0 && z0 >= this.z0 && x1 <= this.x1 && y1 <= this.y1 && z1 <= this.z1;
};
Box.prototype.containsBox = function (box) {
    return this._containsBox(box.x0, box.y0, box.z0, box.x1, box.y1, box.z1);
};
/**
 * half-width in X axis
 * @returns {number}
 */
Box.prototype.getExtentsX = function () {
    return (this.x1 - this.x0) / 2;
};
Box.prototype.getExtentsY = function () {
    return (this.y1 - this.y0) / 2;
};
Box.prototype.getExtentsZ = function () {
    return (this.z1 - this.z0) / 2;
};

/**
 * Accepts ray description, first set of coordinates is origin (oX,oY,oZ) and second is direction (dX,dY,dZ). Algorithm from GraphicsGems by Andrew Woo
 * @param oX
 * @param oY
 * @param oZ
 * @param dX
 * @param dY
 * @param dZ
 */
Box.prototype.intersectRay = function (oX, oY, oZ, dX, dY, dZ) {
    //
    var x0 = this.x0,
        y0 = this.y0,
        z0 = this.z0,
        x1 = this.x1,
        y1 = this.y1,
        z1 = this.z1;
    //


    var boxExtentsX,
        boxExtentsY,
        boxExtentsZ,
        diffX,
        diffY,
        diffZ,
        dirX,
        dirY,
        dirZ,
        centerX,
        centerY,
        centerZ;
    //
    var a, b, c;

    dirX = dX;
    boxExtentsX = (x1 - x0) / 2;
    centerX = x0 + boxExtentsX;
    diffX = oX - centerX;
    a = fabsf(dirX);
    if (fabsf(diffX) > boxExtentsX && diffX * dirX >= 0.0)    return false;
    //
    dirY = dY;
    boxExtentsY = (y1 - y0) / 2;
    centerY = y0 + boxExtentsY;
    diffY = oY - centerY;
    b = fabsf(dirY);
    if (fabsf(diffY) > boxExtentsY && diffY * dirY >= 0.0)    return false;
    //
    dirZ = dZ;
    boxExtentsZ = (z1 - z0) / 2;
    centerZ = z0 + boxExtentsZ;
    diffZ = oZ - centerZ;
    c = fabsf(dirZ);
    if (fabsf(diffZ) > boxExtentsZ && diffZ * dirZ >= 0.0)    return false;

    //Dir.y = 0.5f * (segment.mP1.y - segment.mP0.y);
    //BoxExtents.y = aabb.GetExtents(1);
    //Diff.y = (0.5f * (segment.mP1.y + segment.mP0.y)) - aabb.GetCenter(1);
    //b = fabsf(Dir.y);
    //if(fabsf(Diff.y)>BoxExtents.y + b)	return false;

    var f;
    f = dirY * diffZ - dirZ * diffY;
    if (fabsf(f) > boxExtentsY * c + boxExtentsZ * b)    return false;
    f = dirZ * diffX - dirX * diffZ;
    if (fabsf(f) > boxExtentsX * c + boxExtentsZ * a)    return false;
    f = dirX * diffY - dirY * diffX;
    if (fabsf(f) > boxExtentsX * b + boxExtentsY * a)    return false;

    return true;
};
/**
 * Float ABS, from standard C lib
 * @param val
 * @returns {number}
 */
function fabsf(val) {
    return Math.abs(val);
}

Box.prototype.intersectSegment = function (startX, startY, startZ, endX, endY, endZ) {
    //
    var x0 = this.x0,
        y0 = this.y0,
        z0 = this.z0,
        x1 = this.x1,
        y1 = this.y1,
        z1 = this.z1;
    //


    var boxExtentsX,
        boxExtentsY,
        boxExtentsZ,
        diffX,
        diffY,
        diffZ,
        dirX,
        dirY,
        dirZ,
        centerX,
        centerY,
        centerZ;
    //
    var a, b, c;

    dirX = 0.5 * (endX - startX);
    boxExtentsX = (x1 - x0) / 2;
    centerX = x0 + boxExtentsX;
    diffX = (0.5 * (endX + startX)) - centerX;
    a = fabsf(dirX);
    if (fabsf(diffX) > boxExtentsX + a)    return false;
    //
    dirY = 0.5 * (endY - startY);
    boxExtentsY = (y1 - y0) / 2;
    centerY = y0 + boxExtentsY;
    diffY = (0.5 * (endY + startY)) - centerY;
    b = fabsf(dirY);
    if (fabsf(diffY) > boxExtentsY + b)    return false;
    //
    dirZ = 0.5 * (endZ - startZ);
    boxExtentsZ = (z1 - z0) / 2;
    centerZ = z0 + boxExtentsZ;
    diffZ = (0.5 * (endZ + startZ)) - centerZ;
    c = fabsf(dirZ);
    if (fabsf(diffZ) > boxExtentsZ + c)    return false;

    //Dir.y = 0.5f * (segment.mP1.y - segment.mP0.y);
    //BoxExtents.y = aabb.GetExtents(1);
    //Diff.y = (0.5f * (segment.mP1.y + segment.mP0.y)) - aabb.GetCenter(1);
    //b = fabsf(Dir.y);
    //if(fabsf(Diff.y)>BoxExtents.y + b)	return false;

    var f;
    f = dirY * diffZ - dirZ * diffY;
    if (fabsf(f) > boxExtentsY * c + boxExtentsZ * b)    return false;
    f = dirZ * diffX - dirX * diffZ;
    if (fabsf(f) > boxExtentsX * c + boxExtentsZ * a)    return false;
    f = dirX * diffY - dirY * diffX;
    if (fabsf(f) > boxExtentsX * b + boxExtentsY * a)    return false;

    return true;
};
/**
 * @source http://stackoverflow.com/questions/3106666/intersection-of-line-segment-with-axis-aligned-box-in-c-sharp
 * @param startX
 * @param startY
 * @param startZ
 * @param endX
 * @param endY
 * @param endZ
 * @returns {boolean}
 */
Box.prototype.intersectSegment2 = function (startX, startY, startZ, endX, endY, endZ) {
    //var beginToEnd = segmentEnd - segmentBegin;
    var deltaX = endX - startX,
        deltaY = endY - startY,
        deltaZ = endZ - startZ;
    //var minToMax = new Vector3D(boxSize.X, boxSize.Y, boxSize.Z);

    //var min = boxCenter - minToMax / 2;
    //var max = boxCenter + minToMax / 2;
    //var beginToMin = min - segmentBegin;
    //var beginToMax = max - segmentBegin;
    //var tNear = double.MinValue;
    var tNear = Number.NEGATIVE_INFINITY;
    //var tFar = double.MaxValue;
    var tFar = Number.POSITIVE_INFINITY;
    var t1, t2, tMin, tMax;
    //var intersections = new List<Point3D>();
    //var intersections = [];
    var beginToMin = this.x0 - startX;
    var beginToMax = this.x1 - startX;
    if (deltaX === 0) {//parallel
        if (beginToMin > 0 || beginToMax < 0) {
            return false; //segment is not between planes
        }
    } else {
        t1 = beginToMin / deltaX;
        t2 = beginToMax / deltaX;
        tMin = Math.min(t1, t2);
        tMax = Math.max(t1, t2);
        if (tMin > tNear) {
            tNear = tMin;
        }
        if (tMax < tFar) {
            tFar = tMax;
        }
        if (tNear > tFar || tFar < 0) {
            return false;
        }
    }
    beginToMin = this.y0 - startY;
    beginToMax = this.y1 - startY;
    if (deltaY === 0) {//parallel
        if (beginToMin > 0 || beginToMax < 0) {
            return false; //segment is not between planes
        }
    } else {
        t1 = beginToMin / deltaY;
        t2 = beginToMax / deltaY;
        tMin = Math.min(t1, t2);
        tMax = Math.max(t1, t2);
        if (tMin > tNear) {
            tNear = tMin;
        }
        if (tMax < tFar) {
            tFar = tMax;
        }
        if (tNear > tFar || tFar < 0) {
            return false;
        }
    }
    beginToMin = this.z0 - startZ;
    beginToMax = this.z1 - startZ;
    if (deltaZ === 0) {//parallel
        if (beginToMin > 0 || beginToMax < 0) {
            return false; //segment is not between planes
        }
    } else {
        t1 = beginToMin / deltaZ;
        t2 = beginToMax / deltaZ;
        tMin = Math.min(t1, t2);
        tMax = Math.max(t1, t2);
        if (tMin > tNear) {
            tNear = tMin;
        }
        if (tMax < tFar) {
            tFar = tMax;
        }
        if (tNear > tFar || tFar < 0) {
            return false;
        }
    }
    //
    if (tNear >= 0 && tNear <= 1) {
        //intersections.push({
        //    x: startX + deltaX * tNear,
        //    y: startY + deltaY * tNear,
        //    z: startZ + deltaZ * tNear
        //});
        return true;
    }
    if (tFar >= 0 && tFar <= 1) {
        //intersections.push({
        //    x: startX + deltaX * tFar,
        //    y: startY + deltaY * tFar,
        //    z: startZ + deltaZ * tFar
        //});
        return true;
    }
    return false;
    //foreach (Axis axis in Enum.GetValues(typeof(Axis)))
    //{
    //    if (beginToEnd.GetCoordinate(axis) == 0) // parallel
    //    {
    //        if (beginToMin.GetCoordinate(axis) > 0 || beginToMax.GetCoordinate(axis) < 0)
    //            return intersections; // segment is not between planes
    //    }
    //    else
    //    {
    //        var t1 = beginToMin.GetCoordinate(axis) / beginToEnd.GetCoordinate(axis);
    //        var t2 = beginToMax.GetCoordinate(axis) / beginToEnd.GetCoordinate(axis);
    //        var tMin = Math.Min(t1, t2);
    //        var tMax = Math.Max(t1, t2);
    //        if (tMin > tNear) tNear = tMin;
    //        if (tMax < tFar) tFar = tMax;
    //        if (tNear > tFar || tFar < 0) return intersections;
    //
    //    }
    //}
    //if (tNear >= 0 && tNear <= 1) intersections.Add(segmentBegin + beginToEnd * tNear);
    //if (tFar >= 0 && tFar <= 1) intersections.Add(segmentBegin + beginToEnd * tFar);
    //return intersections;
};
Box.prototype.threeContainsBox = function (box) {
    var min = box.min;
    var max = box.max;
    return this._containsBox(min.x, min.y, min.z, max.x, max.y, max.z);
};
Box.prototype.intersectFrustum = function () {
    var p1 = new THREE.Vector3(),
        p2 = new THREE.Vector3();

    function intersectFrustum(frustum) {
        var planes = frustum.planes;
        for (var i = 0; i < 6; i++) {

            var plane = planes[i];

            p1.x = plane.normal.x > 0 ? this.x0 : this.x1;
            p2.x = plane.normal.x > 0 ? this.x1 : this.x0;
            p1.y = plane.normal.y > 0 ? this.y0 : this.y1;
            p2.y = plane.normal.y > 0 ? this.y1 : this.y0;
            p1.z = plane.normal.z > 0 ? this.z0 : this.z1;
            p2.z = plane.normal.z > 0 ? this.z1 : this.z0;

            var d1 = plane.distanceToPoint(p1);
            var d2 = plane.distanceToPoint(p2);

            // if both outside plane, no intersection

            if (d1 < 0 && d2 < 0) {

                return false;

            }
        }
        return true;
    }

    return intersectFrustum;
}();
module.exports = Box;
