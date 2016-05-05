/**
 *
 * @constructor
 */
var Axis = function () {
    this.scales = [];
};

/**
 *
 * @param [AxisScale} scale to add
 */
Axis.prototype.addScale = function (scale) {
    this.scales.push(scale);
};

module.exports = Axis;