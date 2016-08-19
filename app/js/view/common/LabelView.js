/**
 * Created by Alex on 19/08/2016.
 */

"use strict";

var View = require('./View');

var frameThrottle = require('../FrameThrottle');

var elPrototype = document.createElement('div');
elPrototype.classList.add('label');
elPrototype.style.position = 'absolute';

function passThroughTransformer(v) {
    return v;
}
/**
 *
 * @param {ObservedValue} observedValue
 * @param {function} [transformer] optional code that will be invoked with held value to produce final text for the label
 * @constructor
 */
function LabelView(observedValue, transformer) {
    View.apply(this, arguments);

    if (transformer === undefined) {
        transformer = passThroughTransformer;
    }

    var el = this.el = elPrototype.cloneNode(false);

    var size = this.size;

    function updateSize() {
        var r = el.getBoundingClientRect();

        var w = r.right - r.left;
        var h = r.bottom - r.top;

        size.set(w, h);
    }

    var updateSizeThrottled = frameThrottle(updateSize);

    function setValue(v) {
        el.innerText = transformer(v);
        updateSizeThrottled();
    }

    observedValue.onChanged.add(setValue);
    setValue(observedValue.get());
}

module.exports = LabelView;