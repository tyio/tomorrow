var uuid = require('../../core/uuid');
var ObservedValue = require('../../core/math/ObservedValue');

/**
 *
 * @constructor
 */
var Channel = function Channel() {
    /**
     *
     * @type {string}
     */
    this.id = uuid();
    /**
     * 
     * @type {string}
     */
    this.name = '';
    /**
     * 
     * @type {string}
     */
    this.unit = '';
    /**
     *
     * @type {DataType}
     */
    this.dataType = '';

    /**
     *
     */
    this.minValue = new ObservedValue(Number.POSITIVE_INFINITY);

    /**
     *
     */
    this.maxValue = new ObservedValue(Number.NEGATIVE_INFINITY);
};

module.exports = Channel;