/**
 *
 * @constructor
 */
var AxisView = function (options) {
    /**
     *
     * @type {Element}
     */
    this.el = document.createElement('div');
    this.el.className = 'axis';
    /**
     *
     * @type {null}
     */
    this.axis = options.axis === undefined ? options.axis : null;
    /**
     *
     * @type {Array}
     */
    this.axisScaleViews = typeof options.axisScaleViews == 'array' ? options.axisScaleViews : [];
};

module.exports = AxisView;