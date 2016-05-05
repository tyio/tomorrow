/**
 * Created by Alex on 21/03/2016.
 */
'use strict';
var Signal = require( './../Signal' );
var ObservedValue = function ( v ) {
    var value = v;
    var onChanged = this.onChanged = new Signal();
    Object.defineProperties( this, {
        value : {
            get : function () {
                return value;
            },
            set : function ( v ) {
                if ( v !== value ) {
                    var oldValue = value;
                    value = v;
                    onChanged.dispatch( v, oldValue );
                }
            }
        }
    } )
};

module.exports = ObservedValue;