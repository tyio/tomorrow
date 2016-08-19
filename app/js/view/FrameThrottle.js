/**
 * Created by Alex on 01/11/2014.
 */


"use strict";
/**
 *
 * @param {function} original
 * @returns {proxy}
 */
function throttleWrapper(original) {
    var pending = false;

    function wrap() {
        pending = false;
        original();
    }

    function proxy() {
        if (!pending) {
            pending = true;
            requestAnimationFrame(wrap);
        }
    }

    return proxy;
}

module.exports = throttleWrapper;
