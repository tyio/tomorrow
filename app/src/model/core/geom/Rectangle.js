/**
 * Created by Alex on 14/03/2016.
 */

var Vector2 = require( './Vector2' );
/**
 * Returns true if two 1D lines intersect, touch is treated as intersection
 * Parameters are assumed to be ordered, a1 >= a0, b1 >= b0
 * @param {Number} a0
 * @param {Number} a1
 * @param {Number} b0
 * @param {Number} b1
 */
function intersects1D( a0, a1, b0, b1 ) {
    return a1 >= b0 && b1 >= a0;
}

/**
 * Returns true if two 1D lines overlap, touch is not considered overlap
 * Parameters are assumed to be ordered, a1 > a0, b1 > b0
 * @param {Number} a0
 * @param {Number} a1
 * @param {Number} b0
 * @param {Number} b1
 */
function overlap1D( a0, a1, b0, b1 ) {
    return a1 > b0 && b1 > a0;
}

var Rectangle = function Rectangle( x, y, width, height ) {
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    width = width !== undefined ? width : 0;
    height = height !== undefined ? height : 0;

    this.position = new Vector2( x, y );
    this.size = new Vector2( width, height );
};

Rectangle.prototype.set = function set( x, y, width, height ) {
    this.position.set( x, y );
    this.size.set( width, height );
};
Rectangle.prototype.clone = function () {
    return new Rectangle( this.position.x, this.position.y, this.size.x, this.size.y );
};
Rectangle.prototype._intersects = function ( x0, y0, x1, y1 ) {
    var p = this.position;
    var s = this.size;

    var _x0 = p.x;
    var _y0 = p.y;

    return intersects1D( x0, x1, _x0, s.x + _x0 ) && intersects1D( y0, y1, _y0, _y0 + s.y );
};
Rectangle.prototype.intersects = function ( other ) {
    var x0 = other.position.x;
    var y0 = other.position.y;
    var y1 = other.size.y + y0;
    var x1 = other.size.x + x0;
    return this._intersects( x0, y0, x1, y1 );
};
Rectangle.prototype._overlaps = function ( x0, y0, x1, y1 ) {
    var p = this.position;
    var s = this.size;

    var _x0 = p.x;
    var _y0 = p.y;

    return overlap1D( x0, x1, _x0, s.x + _x0 ) && overlap1D( y0, y1, _y0, _y0 + s.y );
};
Rectangle.prototype.overlaps = function ( other ) {
    var x0 = other.position.x;
    var y0 = other.position.y;
    var y1 = other.size.y + y0;
    var x1 = other.size.x + x0;
    return this._overlaps( x0, y0, x1, y1 );
};

Rectangle.prototype._resizeToFit = function ( x0, y0, x1, y1 ) {
    var size = this.size;

    var _x0 = this.position.x;
    var _y0 = this.position.y;

    var _y1 = size.y + _y0;
    var _x1 = size.x + _x0;

    if ( Number.isNaN( _x1 ) ) {
        _x1 = -Infinity;
    }
    if ( Number.isNaN( _y1 ) ) {
        _y1 = -Infinity;
    }

    var nX0 = Math.min( x0, _x0 );
    var nY0 = Math.min( y0, _y0 );
    var nX1 = Math.max( x1, _x1 );
    var nY1 = Math.max( y1, _y1 );

    this.position.set( nX0, nY0 );
    size.set( nX1 - nX0, nY1 - nY0 );
};

Rectangle.prototype.resizeToFit = function ( other ) {
    var x0 = other.position.x;
    var y0 = other.position.y;
    var y1 = other.size.y + y0;
    var x1 = other.size.x + x0;

    return this._resizeToFit( x0, y0, x1, y1 );
};

Rectangle.prototype._contains = function ( x0, y0, x1, y1 ) {
    var size = this.size;

    var _x0 = this.position.x;
    var _y0 = this.position.y;

    var _y1 = size.y + _y0;
    var _x1 = size.x + _x0;

    return x0 >= _x0 && x1 <= _x1 && y0 >= _y0 && y1 <= _y1;
};

Rectangle.prototype.contains = function(other){
    var x0 = other.position.x;
    var y0 = other.position.y;
    var y1 = other.size.y + y0;
    var x1 = other.size.x + x0;

    return this._contains( x0, y0, x1, y1 );
};

module.exports = Rectangle;