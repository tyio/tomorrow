/**
 *
 * @constructor
 */
var DataFrame = function () {
    /**
     *
     * @type {Array.<Channel>}
     */
    this.channels = [];
    /**
     *
     * @type {Array}
     */
    this.data = [];
    /**
     *
     * @type {Channel}
     */
    this.masterChannel = null;
};

module.exports = DataFrame;