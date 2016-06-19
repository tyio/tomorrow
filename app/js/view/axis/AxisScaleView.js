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

    function handleSelectionChange() {
        self.eraseAxisScale();
        self.drawAxisScale();
    }

    this.selection.position.onChanged.add(handleSelectionChange);
    this.selection.size.onChanged.add(handleSelectionChange);
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

    function draw(orientation) {
        var mark;
        var label;
        var offset;
        var maxSize;
        var markPosition;
        var labelValue;
        var position;

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
            offset = scale * (1 - position % 1);
        } else if (position < 0) {
            offset = Math.abs(scale * (position % 1));
        } else {
            offset = 0;
        }

        var markEls = document.createElement('div');
        markEls.classList.add('marks');


        var i;
        for (i = 0; offset + i * scale <= maxSize; i += self.axisScale.markStride) {
            mark = createMarkElement(orientation);
            label = createLabelElement();
            mark.style[markPosition] = offset + i * scale + 'px';
            label.textContent = Math.ceil(labelValue + i);

            mark.appendChild(label);
            markEls.appendChild(mark);
        }

        return markEls;
    }

    if (this.orientation === Orientation.HORIZONTAL) {
        scale = this.size.x / this.selection.size.x;
    } else if (this.orientation === Orientation.VERTICAL) {
        scale = this.size.y / this.selection.size.y;
    } else {
        return;
    }

    this.marks = draw(this.orientation);
    this.el.appendChild(this.marks);
};

AxisScaleView.prototype.eraseAxisScale = function () {
    var range = document.createRange();
    range.selectNodeContents(this.el);
    range.deleteContents();
};

module.exports = AxisScaleView;