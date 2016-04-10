/**
 *
 * @constructor
 */
var Grid = function () {
    this.scales = {
        x: [],
        y: []
    }
};

/**
 *
 * @param [AxisScale} x scale to add
 */
Grid.prototype.addXAxisScale = function (scale) {
    this.scales.x.push(scale);
};

/**
 *
 * @param [AxisScale} y scale to add
 */
Grid.prototype.addYAxisScale = function (scale) {
    this.scales.y.push(scale);
};
module.exports = Grid;