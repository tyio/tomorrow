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
    this.minValue = new ObservedValue(Number.MAX_VALUE);

    /**
     *
     */
    this.maxValue = new ObservedValue(Number.MIN_VALUE);
};

module.exports = Channel;