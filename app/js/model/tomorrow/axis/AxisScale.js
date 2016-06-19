var ObservedValue = require('../../core/math/ObservedValue');

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
    this.unit = '';
    /**
     *
     * @type {null}
     */
    this.markOffset = null;
    /**
     *
     * @type {null}
     */
    this.markStride = new ObservedValue(1);
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