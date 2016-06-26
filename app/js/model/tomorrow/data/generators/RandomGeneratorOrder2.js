/**
 * Created by Alex on 26/06/2016.
 */

function RandomGeneratorOrder2(offset, startValue, driftRange, noise) {
    this.v0 = offset;
    this.v1 = startValue;
    this.driftRange = driftRange;
    this.driftOffset = driftRange / 2;
    this.noise = noise;
}

RandomGeneratorOrder2.prototype.next = function () {
    var result = this.v0;
    this.v0 += this.v1;
    this.v1 += Math.random() * this.driftRange - this.driftOffset;
    return result + ( Math.random() * this.noise - this.noise / 2);
};

module.exports = RandomGeneratorOrder2;