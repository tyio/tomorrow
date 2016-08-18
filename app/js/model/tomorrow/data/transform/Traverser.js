/**
 * Created by Alex on 18/08/2016.
 */

"use strict";


function Traverser() {
}

/**
 *
 * @param {DataFrame} dataFrame
 * @param {number} startValue
 * @param {number} endValue
 * @param {function} visitor
 */
Traverser.traverseRange = function (dataFrame, startValue, endValue, visitor) {
    var record = [];

    //clamp start and end values to max and min of master value
    var data = dataFrame.data;

    var startIndex = dataFrame.findHighRecordIndexByMasterValue(startValue);
    var endIndex = dataFrame.findLowRecordIndexByMasterValue(endValue);

    for (var i = startIndex; i <= endIndex; i++) {
        data.getRow(i, record);
        visitor(i, record);
    }
};

module.exports = Traverser;