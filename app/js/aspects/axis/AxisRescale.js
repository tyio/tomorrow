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

    aspect.xLimit = aspect.fontSize;
    aspect.yLimit = aspect.lineHeight;

    aspect.selection.size.onChanged.add(rescale);
    aspect.axis.x.on.added.add(rescale);
    aspect.axis.y.on.added.add(rescale);

    function increaseMarkStride(scale) {
        scale.markStride.value = scale.markStride.value * aspect.factor;
    }

    function decreaseMarkStride(scale) {
        scale.markStride.value = scale.markStride.value / aspect.factor;
    }

    function calculateXLimit() {
        var numberOfDigits = Math.floor(aspect.selection.position.x + aspect.selection.size.x).toString().length;
        aspect.xLimit = numberOfDigits * aspect.fontSize;
    }

    function rescale(x, y) {
        var ratio;
        aspect.axis.y.data.forEach(function (axis) {
            axis.scales.forEach(function (scale) {
                ratio = aspect.size.y / aspect.selection.size.y * scale.markStride.value;
                if (ratio < aspect.yLimit) {
                    increaseMarkStride(scale);
                } else if (ratio / aspect.factor > aspect.yLimit) {
                    decreaseMarkStride(scale);
                }
            });
        });

        calculateXLimit();
        aspect.axis.x.data.forEach(function (axis) {
            axis.scales.forEach(function (scale) {
                ratio = aspect.size.x / aspect.selection.size.x * scale.markStride.value;
                if (ratio < aspect.xLimit) {
                    increaseMarkStride(scale);
                } else if (ratio / aspect.factor > aspect.xLimit) {
                    decreaseMarkStride(scale);
                }
            });
        });
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

module.exports = AxisRescale;