/**
 * Created by Alex on 12/04/2016.
 */

var Signal = require('../Signal');

/**
 * List structure with event signals for observing changes.
 * @param {Array.<T>} array
 * @template T
 * @constructor
 */
var List = function (array) {
    this.on = {
        added: new Signal(),
        removed: new Signal()
    };
    this.data = array !== undefined ? array.slice() : [];

    this.length = this.data.length;
};

/**
 *
 * @param {number} index
 * @returns {T}
 */
List.prototype.get = function (index) {
    return this.data[index];
};

List.prototype.add = function (el) {
    this.data.push(el);
    var oldLength = this.length;

    this.length++;

    this.on.added.dispatch(el, oldLength);
};

List.prototype.addAll = function (elements) {
    Array.prototype.push.apply(this.data, elements);
    var oldLength = this.length;
    var addedElementsCount = elements.length;
    this.length += addedElementsCount;

    var added = this.on.added;
    if (added.isConnected()) {
        //only signal if there are listeners attached
        for (var i = 0; i < addedElementsCount; i++) {
            added.dispatch(elements[i], oldLength + i);
        }
    }
};
/**
 *
 * @param {number} index
 * @returns {T}
 */
List.prototype.remove = function (index) {
    var els = this.data.splice(index, 1);
    this.length--;

    var element = els[0];
    this.on.removed.dispatch(element, index);
    return element;
};

List.prototype.sort = function () {
    Array.prototype.sort.apply(this.data, arguments);
    return this;
};

/**
 * Copy of this list
 * @returns {List.<T>}
 */
List.prototype.clone = function () {
    return new List(this.data);
};

/**
 *
 * @param {function} f
 */
List.prototype.forEach = function (f) {
    var l = this.length;
    var data = this.data;
    for (var i = 0; i < l; i++) {
        f(data[i], i);
    }
};

/**
 *
 * @param {function} f
 * @param {*} initial
 * @returns {*}
 */
List.prototype.reduce = function (f, initial) {
    var t = initial;
    this.forEach(function (v) {
        t = f(t, v);
    });
    return t;
};

List.prototype.filter = function (f) {
    return this.data.filter(f);
};

/**
 *
 * @param {function} matcher
 * @param {function} callback
 */
List.prototype.visitFirstMatch = function (matcher, callback) {
    var data = this.data;
    for (var i = 0, l = this.length; i < l; i++) {
        var el = data[i];
        if (matcher(el)) {
            callback(el, i);
            return;
        }
    }
};
/**
 *
 * @param {T} v
 * @returns {boolean}
 */
List.prototype.contains = function (v) {
    return this.data.indexOf(v) !== -1;
};

List.prototype.indexOf = function (el) {
    return this.data.indexOf(el);
};

List.prototype.map = function () {
    return Array.prototype.map.apply(this.data, arguments);
};

List.prototype.reset = function () {
    var length = this.length;
    if (length > 0) {
        var oldElements = this.data;
        this.length = 0;
        this.data = [];

        var removed = this.on.removed;
        if (removed.isConnected()) {
            //only signal if there are listeners attached
            for (var i = 0; i < length; i++) {
                removed.dispatch(oldElements[i], i);
            }
        }
    }
};

List.prototype.copy = function (other) {
    if (this !== other) {
        this.reset();
        if (other.length > 0) {
            if (other instanceof List) {
                this.addAll(other.data);
            } else {
                this.addAll(other);
            }
        }
    }
};

module.exports = List;