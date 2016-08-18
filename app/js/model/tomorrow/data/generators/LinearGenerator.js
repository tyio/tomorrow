/**
 * Created by Alex on 18/08/2016.
 */
"use strict";

function LinearGenerator(startValue, multiplier) {
    this.value = startValue;
    this.multiplier = multiplier;
}

LinearGenerator.prototype.next = function (masterDelta) {
    this.value += masterDelta*this.multiplier;
    return this.value;
};

module.exports = LinearGenerator;