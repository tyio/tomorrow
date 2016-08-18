/**
 * Created by Alex on 18/08/2016.
 */
"use strict";

/**
 *
 * @param {number} period
 * @param {number} amplitude
 * @param {number} phase
 * @param {number} offset
 * @constructor
 */
function SineWaveGenerator(period, amplitude, phase, offset) {
    this.period = period;
    this.amplitude = amplitude;
    this.position = phase*period;
    this.offset = offset;
}

SineWaveGenerator.prototype.next = function (masterDelta) {
    this.position += masterDelta;

    var period = this.period;

    var x = this.position * (Math.PI*2 / period);
    return this.offset + Math.sin(x)*this.amplitude;
};

module.exports = SineWaveGenerator;