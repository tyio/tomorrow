var SimpleRowFirstTable = require( './SimpleRowFirstTable' );

/**
 *
 * @constructor
 */
var DataFrame = function () {
    /**
     *
     * @type {Array.<Channel>}
     */
    this.channels = [];
    /**
     *
     * @type {Array}
     */
    this.data = new SimpleRowFirstTable();
    /**
     *
     * @type {Channel}
     */
    this.masterChannel = null;
};

/**
 *
 * @param {Channel} channel
 */
DataFrame.prototype.addChannel = function ( channel ) {
    this.channels.push( channel );
};

/**
 *
 * @param {Channel} channel
 * @returns {number}
 */
DataFrame.prototype.getValueIndexByChannel = function ( channel ) {
    for ( var i = 0; i < this.channels.length; i++ ) {
        var c = this.channels[ i ];
        if ( c.id === channel.id ) {
            return i;
        }
    }

    return -1;
};

/**
 *
 * @param {Channel} channel to remove
 * @returns {Channel}
 */
DataFrame.prototype.removeChannel = function ( channel ) {
    var i = this.getValueIndexByChannel( channel );

    if ( i != -1 ) {
        this.channels.splice( i, 1 );
        return channel;
    }
};

/**
 *
 * @param {Channel} channel to set as a master
 * @returns {Channel}
 */
DataFrame.prototype.setMasterChannel = function ( channel ) {
    var i = this.getValueIndexByChannel( channel );

    if ( i != -1 ) {
        this.masterChannel = channel;
        return channel;
    }
};

DataFrame.prototype.findLowRecordIndexByMasterValue = function ( v ) {
    var minIndex = 0;
    var data = this.data;
    var maxIndex = data.length - 1;
    var currentIndex;

    var masterValueIndex = this.getValueIndexByChannel( this.masterChannel );
    var record = [];

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) >> 1;

        data.getRow( currentIndex, record );

        var cmp = v - record[ masterValueIndex ];
        
        if ( cmp > 0 ) {
            minIndex = currentIndex + 1;
        }
        else if ( cmp < 0 ) {
            maxIndex = currentIndex - 1;
        }
        else {
            //set low boundary for next step based on assumption that upper bound is higher than lower bound
            break;
        }
    }
    return currentIndex;
};
module.exports = DataFrame;