/**
 * Created by Alex on 22/05/2016.
 */

"use strict";

var UniformSampler = function ( delta ) {
    this.delta = delta;
};


/**
 *
 * @param {DataFrame} dataFrame
 * @param {number} startValue
 * @param {number} endValue
 * @param {function} visitor
 */
UniformSampler.prototype.traverse = function ( dataFrame, startValue, endValue, visitor ) {
    //sanitize inputs
    var delta = this.delta;
    var record = [];

    var data = dataFrame.data;
    var masterChannelPosition = dataFrame.getValueIndexByChannel( dataFrame.masterChannel );

    var record0 = [];
    var record1 = [];

    var numChannels = dataFrame.channels.length;

    function sampleLinear( masterValue, result ) {

        var lowMasterIndex = dataFrame.findLowRecordIndexByMasterValue( masterValue );
        var highMasterIndex = dataFrame.findHighRecordIndexByMasterValue( masterValue );

        if ( lowMasterIndex === highMasterIndex ) {
            data.getRow( lowMasterIndex, result );
        } else {
            data.getRow( lowMasterIndex, record0 );
            data.getRow( highMasterIndex, record1 );

            var masterValue0 = record0[ masterChannelPosition ];
            var masterValue1 = record1[ masterChannelPosition ];

            //find lerp value
            var lerpFactor = (masterValue - masterValue0) / (masterValue1 - masterValue0);

            for ( var i = 0; i < numChannels; i++ ) {
                var v0 = record0[ i ];
                var v1 = record1[ i ];
                result[ i ] = v0 + (v1 - v0) * lerpFactor;
            }
        }

        visitor( result );
    }

    //clamp start and end values to max and min of master value
    var masterMinValue = dataFrame.data.getRowValue(0,masterChannelPosition);
    var masterMaxValue = dataFrame.data.getRowValue(dataFrame.data.length-1, masterChannelPosition);

    var offset = Math.max(startValue, masterMinValue);
    var end = Math.min(endValue, masterMaxValue);

    for ( var i = offset; i <= end; i += delta ) {
        sampleLinear( i, record );
    }
};

module.exports = UniformSampler;