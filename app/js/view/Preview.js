'use strict';
var ChartCanvas = require('./ChartCanvas');
var Rectangle = require('../model/core/geom/Rectangle');
var InteractionController = require('../model/input/InteractionController');

var Preview = function (options) {
    var el = this.el = document.createElement('div');
    var size = options.size;
    var selection = options.selection;
    var dataFrame = options.dataFrame;
    var channelViews = options.channelViews;
    var cursorView = options.cursorView;
    var fullRange = new Rectangle();
    var absoluteMin = Number.POSITIVE_INFINITY;
    var absoluteMax = Number.NEGATIVE_INFINITY;

    for (var i = 0; i < dataFrame.channels.length - 1; i++) {
        var channel = dataFrame.channels[i];
        if (channel === dataFrame.masterChannel) {
            channel.maxValue.react(updatePreviewWidth);
        } else {
            channel.minValue.react(updatePreviewHeightMin);
            channel.maxValue.react(updatePreviewHeightMax);
        }
    }

    this.canvas = new ChartCanvas({
        size: size,
        selection: fullRange,
        dataFrame: dataFrame,
        channelViews: channelViews
    });

    this.canvas.el.style.position = 'absolute';
    this.canvas.el.style.border = 'solid black 1px';
    el.appendChild(this.canvas.el);

    var positionMaskEl = document.createElement('div');
    var positionMask = size.clone();
    positionMask.onChanged.add(renderPositionMask);
    renderPositionMask(positionMask.x, positionMask.y);
    el.appendChild(positionMaskEl);


    var sizeMaskEl = document.createElement('div');
    var sizeMask = size.clone();
    sizeMask.onChanged.add(renderSizeMask);
    renderSizeMask(sizeMask.x, sizeMask.y);
    el.appendChild(sizeMaskEl);

    // subscribe to selection changes
    selection.position.onChanged.add(updatePositionMask);
    updatePositionMask();
    updateSizeMask();

    // subscribe to range changes
    fullRange.size.onChanged.add(function () {
        updatePositionMask();
        updateSizeMask();
    });

    // Create Interaction controller
    var ic = new InteractionController(el);
    ic.pointer.on.down.add(function(){
        cursorView.el.style.display = 'none';
    });

    ic.pointer.on.up.add(function(){
    });

    ic.pointer.on.drag.add(function (position, origin, delta) {
        var x = (delta.x /size.x) * fullRange.size.x;
        selection.position.set(selection.position.x + x, selection.position.y);
    });

    // Helper functions
    function updatePositionMask() {
        var x = (selection.position.x / fullRange.size.x) * size.x;
        x < 0 ? x = 0 : x;
        x > size.x ? x = size.x : x;
        positionMask.set(x, positionMask.y);

        updateSizeMask();
    }

    function updateSizeMask() {
        var x = size.x - (((selection.position.x + selection.size.x) / fullRange.size.x) * size.x);
        x < 0 ? x = 0 : x;
        x > size.x ? x = size.x : x;
        sizeMask.set(x, sizeMask.y);
    }

    function renderPositionMask(x, y) {
        positionMaskEl.style.position = 'absolute';
        positionMaskEl.style.left = '0';
        positionMaskEl.style.borderRight = 'solid black 1px';
        positionMaskEl.style.borderTop = 'solid black 1px';
        positionMaskEl.style.borderBottom = 'solid black 1px';
        positionMaskEl.style.backgroundColor = 'rgba(158, 158, 158, 0.2)';
        positionMaskEl.style.width = x + 'px';
        positionMaskEl.style.height = y + 'px';
    }

    function renderSizeMask(x, y) {
        sizeMaskEl.style.position = 'absolute';
        sizeMaskEl.style.right = '0';
        sizeMaskEl.style.borderLeft = 'solid black 1px';
        sizeMaskEl.style.borderTop = 'solid black 1px';
        sizeMaskEl.style.borderBottom = 'solid black 1px';
        sizeMaskEl.style.backgroundColor = 'rgba(158, 158, 158, 0.2)';
        sizeMaskEl.style.width = x + 'px';
        sizeMaskEl.style.height = y + 'px';
    }

    function updatePreviewWidth(value) {
        fullRange.size.set(value, fullRange.size.y);
    }

    function updatePreviewHeightMin(value) {
        absoluteMin = Math.min(absoluteMin, value);
        updatePreviewHeight();
    }

    function updatePreviewHeightMax(value) {
        absoluteMax = Math.max(absoluteMax, value);
        updatePreviewHeight();
    }

    function updatePreviewHeight() {
        fullRange.position.set(fullRange.position.x, absoluteMin);
        fullRange.size.set(fullRange.size.x, absoluteMax - absoluteMin);
    }
};

module.exports = Preview;