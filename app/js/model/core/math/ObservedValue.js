/**
 * Created by Alex on 21/03/2016.
 */
'use strict';
var Signal = require('./../Signal');
var ObservedValue = function (v) {
    this.onChanged = new Signal();
    this.__value = v;
};
/**
 *
 * @param {*} value
 */
ObservedValue.prototype.set = function (value) {
    if (this.__value !== value) {
        var oldValue = this.__value;
        this.__value = value;
        this.onChanged.dispatch(value, oldValue);
    }
};

/**
 *
 * @returns {*}
 */
ObservedValue.prototype.get = function () {
    return this.__value;
};

/**
 *
 * @param {ObservedValue} other
 */
ObservedValue.prototype.copy = function (other) {
    this.set(other.__value);
};

/**
 *
 * @param {ObservedValue} other
 * @returns {boolean}
 */
ObservedValue.prototype.equals = function (other) {
    return (typeof other === 'object') && this.__value === other.__value;
};

/**
 *
 * @returns {ObservedValue}
 */
ObservedValue.prototype.clone = function () {
    return new ObservedValue(this.__value);
};

ObservedValue.prototype.toString = function () {
    return JSON.stringify({
        value: this.__value
    });
};

ObservedValue.prototype.react = function (f) {
    f(this.__value);
    this.onChanged.add(f);
};

module.exports = ObservedValue;