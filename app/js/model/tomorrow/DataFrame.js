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

/**
 * Adds a new channel
 * @param channel channel to be added
 */
DataFrame.prototype.addChannel = function (channel) {
    this.channels.push(channel);
};

/**
 * Removes channel by its id
 * @param id id of the channel to be removed
 */
DataFrame.prototype.removeChannel = function(id) {
    for (var i = 0; i < this.channels.length; i++) {
        var channel = this.channels[i];
        if (channel.id === id) {
            this.channels.splice(i, 1);
            return channel;
        }
    }
};

module.exports = DataFrame;