/**
 * Created by Alex on 18/08/2016.
 */

"use strict";

var Traverser = require('./Traverser');

/**
 *
 * @param {number} bucketSize interval on master channel over which to bucket samples
 * @constructor
 */
function BucketTraverser(bucketSize) {
    /**
     *
     * @type {number}
     */
    this.bucketSize = bucketSize;
}

/**
 *
 * @param {DataFrame} dataFrame
 * @param {number} startValue
 * @param {number} endValue
 * @param {function} visitorSample
 * @param {function} visitorBucketStart
 */
BucketTraverser.prototype.traverse = function (dataFrame, startValue, endValue, visitorSample, visitorBucketStart) {

    var bucketSize = this.bucketSize;

    var lastBucketStart = startValue;

    var masterChannelPosition = dataFrame.getValueIndexByChannel(dataFrame.masterChannel);

    var sampleCount = 0;
    function processSample(index, record) {
        //get master value
        var masterValue = record[masterChannelPosition];
        while (masterValue - lastBucketStart >= bucketSize) {
            //bucket ended, start a new one
            lastBucketStart += bucketSize;
            visitorBucketStart(lastBucketStart, sampleCount);
            sampleCount = 0;
        }
        sampleCount++;
        visitorSample(record);
    }

    Traverser.traverseRange(dataFrame, startValue, endValue, processSample);
};

module.exports = BucketTraverser;

