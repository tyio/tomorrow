/**
 *
 * @constructor
 */
var Chart = function () {
    /**
     *
     * @type {null}
     */
    this.selection = null;
    /**
     *
     * @type {null}
     */
    this.chartCanvas = null;
    /**
     *
     * @type {GridView}
     */
    this.gridView = null;
    /**
     *
     * @type {{x: Array, y: Array}}
     */
    this.axisViews = {
        x: [],
        y: []
    }
};

/**
 *
 * @param [AxisView} x axis view to add
 */
Chart.prototype.addXAxisView = function (axisView) {
    this.axisViews.x.push(axisView);
};

/**
 *
 * @param [AxisView} y axis view to add
 */
Chart.prototype.addYAxisView = function (axisView) {
    this.axisViews.y.push(axisView);
};

module.exports = Chart;