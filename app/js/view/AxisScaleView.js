var AxisScaleStyle = require( './AxisScaleStyle');

/**
 *
 * @constructor
 */
var AxisScaleView = function (options) {
    /**
     *
     * @type {null}
     */
    this.axisScale = options.axisScale === undefined ? options.axisScale : null;
    /**
     *
     * @type {null}
     */
    this.style = options.style === undefined ? options.style : new AxisScaleStyle();
};

module.exports = AxisScaleView;