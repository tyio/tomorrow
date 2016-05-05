/**
 * Created by Alex on 12/04/2016.
 */

var Signal = require( '../Signal' );

/**
 * List structure with event signals for observing changes.
 * @param array
 * @constructor
 */
var List = function ( array ) {
    this.on = {
        added : new Signal(),
        removed : new Signal()
    };
    this.data = array !== undefined ? array.slice() : [];

    this.length = this.data.length;
};

List.prototype.get = function ( index ) {
    return this.data[ index ];
};

List.prototype.add = function ( el ) {
    this.data.push( el );
    var oldLength = this.length;

    this.length++;

    this.on.added.dispatch( [ el ], oldLength );
};

List.prototype.addAll = function ( elements ) {
    Array.prototype.push.apply( this.data, elements );
    var oldLength = this.length;
    this.length += elements.length;

    this.on.added.dispatch( elements, oldLength );
};

List.prototype.remove = function ( index ) {
    var els = this.data.splice( index, 1 );
    this.length--;

    this.on.removed.dispatch( els, index );
    return els[ 0 ];
};

List.prototype.indexOf = function ( el ) {
    return this.data.indexOf( el );
};

List.prototype.map = function () {
    return Array.prototype.map.apply( this.data, arguments );
};

List.prototype.copy = function ( other ) {
    if ( this.length > 0 ) {
        var oldElements = this.data;
        this.length = 0;
        this.data = [];
        this.on.removed.dispatch( oldElements, 0 );
    }
    if ( other.length > 0 ) {
        this.addAll( other.data );
    }
};

module.exports = List;