var Orientation = require('../../model/tomorrow/axis/Orientation');
var List = require('../../model/core/collection/List');

var AxisRescale = function (options) {
    var aspect = this;
    aspect.size = options.size;
    aspect.selection = options.selection;
    aspect.axis = {
        x: new List(),
        y: new List()
    };
    aspect.factor = 10;
    aspect.fontSize = 5;
    aspect.lineHeight = 15;

    aspect.xLimit = calculateXLimit();
    aspect.yLimit = aspect.lineHeight;

    aspect.selection.size.onChanged.add(rescale);

    function calculateXLimit() {
        var numberOfDigits = Math.floor(aspect.selection.position.x + aspect.selection.size.x).toString().length;
        aspect.xLimit = numberOfDigits * aspect.fontSize;
    }

    function rescaleY(axis){
        aspect.adjustAxisScales(axis, aspect.size.y, aspect.selection.size.y, aspect.yLimit);
    }

    function rescaleX(axis) {
        aspect.adjustAxisScales(axis, aspect.size.x, aspect.selection.size.x, aspect.xLimit);
    }

    function rescale() {
        calculateXLimit();
        aspect.axis.x.data.forEach(rescaleX);
        aspect.axis.y.data.forEach(rescaleY);
    }
};

/**
 *
 * @param [AxisScale} scale to register
 */
AxisRescale.prototype.register = function (axis, orientation) {
    if (orientation === Orientation.HORIZONTAL) {
        this.axis.x.add(axis);
    } else if (orientation === Orientation.VERTICAL) {
        this.axis.y.add(axis);
    }
};


AxisRescale.prototype.adjustAxisScales = function(axis, size, selectionSize, limit) {
    var self = this;
    axis.scales.forEach(function(scale){
        var strideValue = scale.markStride.value;

        var ratio;
        var adjusted = false;
        while (!adjusted){
            ratio = size / selectionSize * strideValue;
            if (ratio < limit) {
                strideValue = strideValue * self.factor;
            } else if (ratio / self.factor > limit) {
                strideValue = strideValue / self.factor;
            } else {
                adjusted = true;
            }
        }

        scale.markStride.value = strideValue;
    });
};

module.exports = AxisRescale;