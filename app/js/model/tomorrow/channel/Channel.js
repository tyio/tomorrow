var uuid = require('../../core/uuid');

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
};

module.exports = Channel;