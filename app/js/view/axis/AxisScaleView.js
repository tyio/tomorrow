var AxisScaleStyle = require('./AxisScaleStyle');
var Vector2 = require('../../model/core/geom/Vector2');
var Orientation = require( '../../model/tomorrow/axis/Orientation' );

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

    /**
     *
     * @type {Orientation}
     */
    this.orientation = options.orientation !== undefined ? options.orientation : Orientation.HORIZONTAL;

    this.drawAxisScale();

};

AxisScaleView.prototype.drawAxisScale = function () {

    function clipNumberOfMarks(numberOfMarks, totalSpace, minSpacing) {
        var maxMarks = Math.floor(totalSpace/minSpacing);
        return Math.min(maxMarks, numberOfMarks);
    }

    if (!this.axisScale) {
        return;
    }

    if (this.style.showMarks) {
        var numberOfMarks;
        var scale;
        var mark;

        if (this.orientation === Orientation.HORIZONTAL) {
            numberOfMarks = this.selection.size.x - this.selection.position.x;
            numberOfMarks = clipNumberOfMarks(numberOfMarks, this.size.x, 50);
            scale = this.size.x / numberOfMarks;
        } else if (this.orientation === Orientation.VERTICAL){
            numberOfMarks = this.selection.size.y - this.selection.position.y;
            numberOfMarks = clipNumberOfMarks(numberOfMarks, this.size.y, 50);
            scale = this.size.y / numberOfMarks;
        } else {
            return;
        }

        for (var i=0; i <= numberOfMarks; i=i+this.axisScale.markStride){
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