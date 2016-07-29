'use strict';
var Vector2 = require('../model/core/geom/Vector2');

var ChartCanvasGL = require('./graphics/ChartCanvasGL');
var List = require('../model/core/collection/List');

var ChartCanvas = function (options) {
    this.size = options.size !== undefined ? options.size : new Vector2();

    /**
     *
     * @type {Rectangle}
     */
    this.selection = options.selection !== undefined ? options.selection : null;

    this.dataFrame = options.dataFrame !== undefined ? options.dataFrame : null;

    this.channelViews = new List(options.channelViews);

    var glCanvas = new ChartCanvasGL(this);

    this.el = document.createElement('div');
    this.el.style.position = 'relative';
    this.el.appendChild(glCanvas.el);
};

module.exports = ChartCanvas;