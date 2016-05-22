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
    }

    this.size = null;
};

/**
 *
 * @param [AxisView} axis view to add
 */
Chart.prototype.addAxisView = function (axisView) {
    var margin;
    if (axisView.orientation === Orientation.HORIZONTAL) {
        this.axisViews.x.push(axisView);

        margin = parseFloat(this.chartCanvas.el.style.marginBottom) || 0;
        this.chartCanvas.el.style.marginBottom = margin + 50 + 'px';
    } else if (axisView.orientation === Orientation.VERTICAL) {
        this.axisViews.y.push(axisView);

        margin = parseFloat(this.chartCanvas.el.style.marginLeft) || 0;
        this.chartCanvas.el.style.marginLeft = margin + 50 + 'px';
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