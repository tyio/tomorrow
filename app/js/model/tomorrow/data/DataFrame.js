var RowFirstTable = require( './RowFirstTable' );

/**
 * Schema is immutable. Once DataFrame is created, it can not be changed without creating a new data frame.
 * @constructor
 */
var DataFrame = function (channels, masterChannel) {
    /**
     *
     * @type {Array.<Channel>}
     */
    this.channels =  channels;

    /**
     *
     * @type {Array}
     */
    this.data = new RowFirstTable(channels.map(function ( c ) {
        return c.dataType;
    }));

    /**
     *
     * @type {Channel}
     */
    this.masterChannel = masterChannel;
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

//FIXME this code is wrong and need to be rewritten
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
    return minIndex;
};

//FIXME this code is wrong and need to be rewritten
DataFrame.prototype.findHighRecordIndexByMasterValue = function ( v ) {
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
    return maxIndex;
};

module.exports = DataFrame;