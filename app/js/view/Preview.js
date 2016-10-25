'use strict';
var ChartCanvas = require('./ChartCanvas');
var Rectangle = require('../model/core/geom/Rectangle');

var Preview = function (options) {
    this.el = document.createElement('div');
    var size = options.size;
    var selection = options.selection;
    var dataFrame = options.dataFrame;
    var channelViews = options.channelViews;
    var range = new Rectangle();

    var rangeSelectorEl = document.createElement('div');

    var absoluteMin = Number.POSITIVE_INFINITY;
    var absoluteMax = Number.NEGATIVE_INFINITY;

    dataFrame.channels.forEach(function (channel) {
        if (channel === dataFrame.masterChannel) {
            channel.maxValue.react(adjustPreviewWidth);
        } else {
            channel.minValue.react(adjustPreviewHeightMin);
            channel.maxValue.react(adjustPreviewHeightMax);
        }
    });

    this.canvas = new ChartCanvas({
        size: size,
        selection: range,
        dataFrame: dataFrame,
        channelViews: channelViews
    });

    this.canvas.el.style.position = 'absolute';
    this.canvas.el.style.border = 'solid black 1px';

    this.el.appendChild(this.canvas.el);

    rangeSelectorEl.style.position = 'absolute';
    rangeSelectorEl.style.border = 'solid black 1px';
    rangeSelectorEl.style.backgroundColor = 'rgba(158, 158, 158, 0.2)';
    rangeSelectorEl.style.width = size.x + 'px';
    rangeSelectorEl.style.height = size.y + 'px';

    this.el.appendChild(rangeSelectorEl);

    function adjustPreviewWidth(value) {
        range.size.set(value, range.size.y);

        var position = (selection.position.x / value) * size.x;
        var width = (selection.size.x / value) * size.x;

        if (position < 0) {
            if ((width + position) < 0) {
                width = 0;
            } else if (position + width > size.x) {
                width = size.x;
            } else {
                width = width + position;
            }

            position = 0;
        }  else if (position > size.x) {
            position = size.x;
            width = 0;
        } else if (position + width > size.x) {
            width = size.x - position;
        }

        rangeSelectorEl.style.left = position + 'px';
        rangeSelectorEl.style.width = width + 'px';
    }

    function adjustPreviewHeightMin(value) {
        absoluteMin = Math.min(absoluteMin, value);
        adjustPreviewHeight();
    }

    function adjustPreviewHeightMax(value) {
        absoluteMax = Math.max(absoluteMax, value);
        adjustPreviewHeight();
    }

    function adjustPreviewHeight() {
        range.position.set(range.position.x, absoluteMin);
        range.size.set(range.size.x, absoluteMax - absoluteMin);
    }
};

module.exports = Preview;