var AxisScaleStyle = require('./AxisScaleStyle');
var Vector2 = require('../../model/core/geom/Vector2');
var Orientation = require('../../model/tomorrow/axis/Orientation');

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

    var self = this;

    function redraw() {
        self.eraseAxisScale();
        self.drawAxisScale();
    }

    this.axisScale.markStride.onChanged.add(redraw);
    this.selection.position.onChanged.add(redraw);
    this.selection.size.onChanged.add(redraw);
};

/**
 *
 */
AxisScaleView.prototype.drawAxisScale = function () {
    if (!this.axisScale) {
        return;
    }

    if (!this.style.showMarks) {
        return;
    }

    this.drawMarks();

    if (this.style.showName) {
        var nameElement = document.createElement('span');
        nameElement.textContent = this.axisScale.name;
        //this.el.appendChild(nameElement);
    }
};

AxisScaleView.prototype.drawMarks = function () {
    var self = this;
    var scale;

    if (this.orientation === Orientation.HORIZONTAL) {
        scale = this.size.x / this.selection.size.x;
    } else if (this.orientation === Orientation.VERTICAL) {
        scale = this.size.y / this.selection.size.y;
    } else {
        return;
    }

    this.marks = draw(this.orientation);
    this.el.appendChild(this.marks);

    function createMarkElement(orientation) {
        var mark = document.createElement('div');

        mark.classList.add('mark');
        mark.classList.add(orientation);

        return mark;
    }

    function createLabelElement() {
        var label = document.createElement('span');

        label.classList.add('label');

        return label;
    }


    function getRemainder (number) {
        var fraction = String(number).split('.')[1];
        if (fraction){
            return fraction.length;
        } else {
            return 0;
        }
    }

    function draw(orientation) {
        var mark;
        var label;
        var offset;
        var maxSize;
        var markPosition;
        var labelValue;
        var position;
        var markStride = self.axisScale.markStride.value;
        var precision =  getRemainder(markStride);


        if (orientation === Orientation.HORIZONTAL) {
            position = self.selection.position.x;
            maxSize = self.size.x;
            markPosition = 'left';
            labelValue = self.selection.position.x;
        } else if (orientation === Orientation.VERTICAL) {
            position = self.selection.position.y;
            maxSize = self.size.y;
            markPosition = 'bottom';
            labelValue = self.selection.position.y;
        }

        if (position > 0) {
            offset = scale * (markStride - position % markStride);
        } else if (position < 0) {
            offset = Math.abs(scale * (position % markStride));
        } else {
            offset = 0;
        }

        var markEls = document.createElement('div');
        markEls.classList.add('marks');

        var i;
        var value;
        for (i = 0; offset + i * scale <= maxSize; i += markStride) {
            mark = createMarkElement(orientation);
            label = createLabelElement();
            mark.style[markPosition] = offset + i * scale + 'px';
            value = Math.ceil((labelValue + i)/markStride) * markStride;
            value = value.toLocaleString('en', {maximumFractionDigits: precision, useGrouping:false});

            label.textContent = value;

            mark.appendChild(label);
            markEls.appendChild(mark);
        }

        return markEls;
    }
};

AxisScaleView.prototype.eraseAxisScale = function () {
    var range = document.createRange();
    range.selectNodeContents(this.el);
    range.deleteContents();
};

module.exports = AxisScaleView;