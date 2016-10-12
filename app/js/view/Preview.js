'use strict';
var ChartCanvas = require('./ChartCanvas');
var Rectangle = require('../model/core/geom/Rectangle');

var Preview = function (options) {
    var size = options.size;
    var dataFrame = options.dataFrame;
    var channelViews = options.channelViews;
    var range = new Rectangle();

    var absoluteMin = Number.POSITIVE_INFINITY;
    var absoluteMax = Number.NEGATIVE_INFINITY;

    dataFrame.channels.forEach(function(channel){
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
    this.canvas.el.style.marginLeft = '50px';
    this.canvas.el.style.border = 'solid black 1px';
    this.canvas.el.style.backgroundColor = 'beige';

    function adjustPreviewWidth(value){
        range.size.set(value, range.size.y);
    }

    function adjustPreviewHeightMin(value){
        absoluteMin = Math.min(absoluteMin, value);
        adjustPreviewHeight();
    }

    function adjustPreviewHeightMax(value){
        absoluteMax = Math.max(absoluteMax, value);
        adjustPreviewHeight();
    }

    function adjustPreviewHeight() {
        range.position.set(range.position.x, absoluteMin);
        range.size.set(range.size.x, absoluteMax-absoluteMin);
    }
};

module.exports = Preview;