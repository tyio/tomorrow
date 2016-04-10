var AxisScaleStyle = require('./AxisScaleStyle');
var Vector2 = require('../model/core/geom/Vector2');

/**
 *
 * @constructor
 */
var AxisScaleView = function (options) {
    /**
     *
     * @type {Element}
     */
    this.el = document.createElement('div');
    this.el.className = 'axis-scale';

    /**
     *
     * @type {null}
     */
    this.axisScale = options.axisScale !== undefined ? options.axisScale : null;
    /**
     *
     * @type {null}
     */
    this.style = options.style !== undefined ? options.style : new AxisScaleStyle();

    /**
     *
     * @type {Vector2}
     */
    this.size = options.size !== undefined ? options.size : new Vector2();

    /**
     *
     * @type {Rectangle}
     */
    this.selection = options.selection !== undefined ? options.selection : null;

    this.drawAxisScale();

};

AxisScaleView.prototype.drawAxisScale = function () {
    if (!this.axisScale) {
        return;
    }

    if (this.style.showMarks) {
        var numberOfMarks = this.selection.size.x - this.selection.position.x;
        var scale = this.size.x / this.selection.size.x;
        var mark;
        for (var i=0; i <= numberOfMarks; i=i+this.axisScale.markStride){
            console.log(i);
            mark = document.createElement('div');
            mark.style.position = 'absolute';
            mark.style.left = i * scale + 'px';
            this.el.appendChild(mark);
        }
    }

    if (this.style.showName) {
        var nameElement = document.createElement('span');
        nameElement.textContent = this.axisScale.name;
        this.el.appendChild(nameElement);
    }
};

module.exports = AxisScaleView;