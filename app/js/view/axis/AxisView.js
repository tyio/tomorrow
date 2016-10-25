var Vector2 = require( '../../model/core/geom/Vector2' );
var Orientation = require( '../../model/tomorrow/axis/Orientation' );

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

    if (this.orientation === Orientation.HORIZONTAL) {
        this.el.style.height = '50px';
        this.el.style.width = this.size.x + 'px';
        this.el.classList.add(Orientation.HORIZONTAL);
    } else if (this.orientation === Orientation.VERTICAL) {
        this.el.style.position = 'absolute';
        this.el.style.top = '0';
        this.el.style.left = '0';
        this.el.style.height = this.size.y + 'px';
        this.el.classList.add(Orientation.VERTICAL);
    }
    this.axisScaleViews.forEach(this.addAxisScaleView, this);
};

/**
 *
 * @param axisScaleView
 */
AxisView.prototype.addAxisScaleView = function (axisScaleView) {
    this.el.appendChild(axisScaleView.el);
};

module.exports = AxisView;