/**
 * Created by Alex on 21/03/2016.
 */

var Signal = require( "../Signal" );
/**
 *
 * @param {Number} c
 * @param {Number} l
 * @constructor
 */
var BoundedValue = function ( c, l ) {
    var current = c !== undefined ? c : 0;
    var limit = l !== undefined ? l : 0;

    var signals = this.on = {
        changed : new Signal(),
        overflow : new Signal()
    };

    Object.defineProperties( this, {
        value : {
            get : function () {
                return current;
            },
            set : function ( v ) {
                if ( current === v ) {
                    //no change
                    return;
                }

                var spill = v - limit;
                var oldValue = current;
                //dispatch change
                var isOverflow = (spill > 0);
                current = isOverflow ? limit : v;
                signals.changed.dispatch( current, limit, oldValue, limit );

                if ( isOverflow ) {
                    signals.overflow.dispatch( spill );
                }
            }
        },
        limit : {
            get : function () {
                return limit;
            },
            set : function ( v ) {
                if ( v === limit ) {
                    //no change
                    return;
                }
                var oldValue = limit;
                var newValue = v;

                limit = newValue;
                if ( newValue < current ) {
                    signals.changed.dispatch( newValue, limit, current, oldValue );
                    //bounded value is being shrunk
                    signals.overflow.dispatch( current - newValue );
                } else {
                    signals.changed.dispatch( current, limit, current, oldValue );
                }
            }
        }
    } );
};

BoundedValue.prototype.copy = function ( other ) {
    this.value = other.value;
    this.limit = other.limit;
    return this;
};

module.exports = BoundedValue;