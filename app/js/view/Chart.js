var Orientation = require( '../model/tomorrow/axis/Orientation');

/**
 *
 * @constructor
 */
var Chart = function () {
    /**
     *
     * @type {Element}
     */
    this.el = document.createElement('div');
    this.el.className = 'chart';
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
    };

    this.size = null;
};

/**
 *
 * @param [AxisView} axis view to add
 */
Chart.prototype.addAxisView = function (axisView) {
    if (axisView.orientation === Orientation.HORIZONTAL) {
        this.axisViews.x.push(axisView);
    } else if (axisView.orientation === Orientation.VERTICAL) {
        this.axisViews.y.push(axisView);
    }

    this.el.appendChild(axisView.el);
};

/**
 *
 * @param chartCanvas
 */
Chart.prototype.setChartCanvas = function (chartCanvas) {
    this.chartCanvas = chartCanvas;
    this.chartCanvas.selection = this.selection;
    this.el.appendChild(this.chartCanvas.el);
};

module.exports = Chart;