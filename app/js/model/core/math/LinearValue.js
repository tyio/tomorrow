/**
 * Created by Alex on 27/03/2016.
 */

var LinearValue = function ( x, a, b ) {
    this.x = x;
    this.a = a !== undefined ? a : 0;
    this.b = b !== undefined ? b : 1;

    var self =this;
    function computeValue(  ) {
        return self.a + self.b* self.x;
    }

    Object.defineProperties(this,{
        value:{
            configurable: false,
            writable:false,
            get: computeValue
        }
    });
};

LinearValue.prototype.value = function () {
    // y = b*x + a
    return this.x * this.b + this.a;
};

module.exports = LinearValue;