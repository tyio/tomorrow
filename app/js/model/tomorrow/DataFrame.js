var SimpleRowFirstTable = require('./SimpleRowFirstTable');

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
    this.data = new SimpleRowFirstTable();
    /**
     *
     * @type {Channel}
     */
    this.masterChannel = null;
};

/**
 *
 * @param {Channel} channel
 */
DataFrame.prototype.addChannel = function (channel) {
    this.channels.push(channel);
};

/**
 *
 * @param {Channel} channel
 * @returns {number}
 */
DataFrame.prototype.getValueIndexByChannel = function (channel) {
    for (var i = 0; i < this.channels.length; i++) {
        var c = this.channels[i];
        if (c.id === channel.id) {
            return i;
        }
    }

    return -1;
};

/**
 *
 * @param {Channel} channel to remove
 * @returns {Channel}
 */
DataFrame.prototype.removeChannel = function(channel) {
    var i = this.getValueIndexByChannel(channel);

    if (i != -1) {
        this.channels.splice(i, 1);
        return channel;
    }
};

/**
 *
 * @param {Channel} channel to set as a master
 * @returns {Channel}
 */
DataFrame.prototype.setMasterChannel = function(channel){
    var i = this.getValueIndexByChannel(channel);

    if (i != -1) {
        this.masterChannel = channel;
        return channel;
    }
};

module.exports = DataFrame;