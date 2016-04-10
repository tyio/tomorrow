/**
 *
 * @constructor
 */
var AxisScale = function () {
    /**
     *
     * @type {string}
     */
    this.name = '';
    /**
     *
     * @type {Array}
     */
    this.units = [];
    /**
     *
     * @type {null}
     */
    this.markOffset = null;
    /**
     *
     * @type {null}
     */
    this.markStride = null;
    /**
     *
     * @type {null}
     */
    this.markStrideSkip = null;
    /**
     *
     * @type {null}
     */
    this.markStrideFill = null;
};

module.exports = AxisScale;