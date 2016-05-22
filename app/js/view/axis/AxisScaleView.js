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

    /**
     *
     * @type {null}
     */
    this.marks = null;

    this.drawAxisScale();
};

/**
 *
 */
AxisScaleView.prototype.drawAxisScale = function () {

    if (!this.axisScale) {
        return;
    }

    if (this.style.showMarks) {
        var numberOfMarks;
        var scale;

        function clipNumberOfMarks(numberOfMarks, totalSpace, minSpacing) {
            var maxMarks = Math.floor(totalSpace/minSpacing);
            return Math.min(maxMarks, numberOfMarks);
        }

        function drawMarks (orientation, offset ) {
            var markEls = document.createElement('div');
            markEls.classList.add('marks');
            var mark;
            var label;
            for (var i = 0; i <= numberOfMarks; i= i + offset){
                mark = document.createElement('div');
                mark.classList.add('mark');
                mark.classList.add(orientation);

                if (orientation === Orientation.HORIZONTAL) {
                    mark.style.left = i * scale + 'px';
                } else if (orientation === Orientation.VERTICAL){
                    mark.style.bottom = i * scale + 'px';
                }

                label = document.createElement('span');
                label.classList.add('label');
                label.textContent = i;

                mark.appendChild(label);
                markEls.appendChild(mark);
            }
            return markEls;
        }

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

        this.marks = drawMarks(this.orientation, this.axisScale.markStride);
        this.el.appendChild(this.marks);
    }

    if (this.style.showName) {
        var nameElement = document.createElement('span');
        nameElement.textContent = this.axisScale.name;
        //this.el.appendChild(nameElement);
    }
};


module.exports = AxisScaleView;