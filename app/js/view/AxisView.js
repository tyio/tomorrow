var Vector2 = require( '../model/core/geom/Vector2' );
var Orientation = require( '../model/tomorrow/Orientation' );

/**
 *
 * @constructor
 */
var AxisView = function (options) {
    /**
     *
     * @type {Element}
     */
    this.el = document.createElement('div');
    this.el.className = 'axis';
    /**
     *
     * @type {null}
     */
    this.axis = options.axis !== undefined ? options.axis : null;
    /**
     *
     * @type {Array}
     */
    this.axisScaleViews = typeof options.axisScaleViews == 'object' ? options.axisScaleViews : [];

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

    this.el.style.width = this.size.x + 'px';

    this.axisScaleViews.forEach(this.addAxisScaleView, this);
};

AxisView.prototype.addAxisScaleView = function (axisScaleView) {
    this.el.appendChild(axisScaleView.el);
};

module.exports = AxisView;