/**
 * Created by Alex on 01/09/2014.
 */


"use strict";
var Signal = function () {
    this.silent = false;
    this.handlers = [];
    this.handlersSingle = [];
};
Signal.prototype.contains = function(h){
    var handlers = this.handlers;
    for(var i=0, l=handlers.length; i<l; i++){
        if(handlers[i] === h){
            return true;
        }
    }
    return false;
};
Signal.prototype.mute = function(){
    this.silent = true;
};
Signal.prototype.unmute = function(){
    this.silent = false;
};

/**
 * Tells if there are any handlers attached to the signal or not
 * @returns {boolean}
 */
Signal.prototype.isConnected = function () {
    return this.handlers.length > 0 || this.handlersSingle.length > 0;
};

/**
 *
 * @param {function} h
 */
Signal.prototype.addOne = function(h){
    this.handlersSingle.push(h);
};

/**
 *
 * @param {function} h
 */
Signal.prototype.add = function(h){
    if(!this.contains(h)){
        this.handlers.push(h);
    }
};
/**
 *
 * @param {function} h
 */
Signal.prototype.remove = function(h){
    var handlers = this.handlers;
    var i = handlers.indexOf(h);
    if (i >= 0) {
        handlers.splice(i, 1);
    }
    //single handlers
    var handlersSingle = this.handlersSingle;
    i = handlersSingle.indexOf(h);
    if (i >= 0) {
        handlersSingle.splice(i, 1);
    }
};
Signal.prototype.dispatch = function () {
    if (this.silent) {
        //don't dispatch any events while silent
        return;
    }
    var handlers = this.handlers;
    var i, h;
    for (i = handlers.length - 1; i >= 0; i--) {
        h = handlers[i];
        h.apply(void 0, arguments);
    }

    var handlersSingle = this.handlersSingle;

    var numHandlersSingle = handlersSingle.length;
    if(numHandlersSingle>0) {
        for ( i =  numHandlersSingle - 1; i >= 0; i-- ) {
            h = handlersSingle[ i ];
            h.apply( void 0, arguments );
        }
        handlersSingle.length = 0;
    }
};
module.exports = Signal;
