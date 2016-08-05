/**
 * Created by Alex on 29/07/2016.
 */
"use strict";

var ObservedValue = require('../../../model/core/math/ObservedValue');
var UniformSampler = require('../../../model/tomorrow/data/transform/UniformSampler');
var LineSegment1 = require('../../../model/core/geom/LineSegment1');

/**
 *
 * @param {ChannelView} channelView
 * @constructor
 */
function MarkerView(channelView) {
    this.position = new ObservedValue(0);

    this.channelView = channelView;
    this.value = new ObservedValue();

    var el = this.el = document.createElement('div');
    el.classList.add('marker');

    var elValue = document.createElement('div');
    var elLabel = document.createElement('div');
    var elSymbol = document.createElement('div');

    elValue.classList.add('value');
    elLabel.classList.add('label');
    elSymbol.classList.add('symbol');


    el.appendChild(elValue);
    el.appendChild(elLabel);
    el.appendChild(elSymbol);

    elSymbol.style.backgroundColor = channelView.style.color;
    elLabel.innerText = channelView.channel.name;
    this.value.onChanged.add(function (v) {
        elValue.innerText = v;
    });


    this.position.onChanged.add(function (v) {
        el.style.bottom = v + "px";
    });
}

/**
 *
 * @param {MarkerView} markerViews
 * @param {LineSegment1} limits
 */
function resolveMarkerOverlap(markerViews, limits) {
    function getMarkerHeight(markerView) {
        return 20; //TODO actually calculate this value
    }

    //generate segments
    var segments = markerViews.map(function (v) {
        var height = getMarkerHeight(v);
        var h_2 = height / 2;
        var p0 = v.position.get() - h_2;
        var segment1 = new LineSegment1(p0, p0 + height);
        return segment1;
    });
    LineSegment1.resolveOverlap(segments, limits);
    segments.forEach(function (segment, index) {
        var markerView = markerViews[index];
        var height = getMarkerHeight(markerView);
        markerView.position.set(segment.p0 + height / 2);
    });
}

/**
 *
 * @param {ChartCanvas} chartCanvas
 * @constructor
 */
var CursorView = function (chartCanvas) {
    var position = this.position = new ObservedValue(0);
    this.chartCanvas = chartCanvas;

    var el = this.el = document.createElement('div');
    el.style.position = 'absolute';
    el.classList.add('cursor');

    var elMarkerContainer = document.createElement('div');
    el.appendChild(elMarkerContainer);

    var markerViews = [];

    var sampler = new UniformSampler(1);

    function updateValues() {
        var p = position.get();

        var dataFrame = chartCanvas.dataFrame;
        //using traversal of 0 length, this should be refactored into something nicer looking
        sampler.traverse(dataFrame, p, p, function (values) {
            markerViews.forEach(function (markerView) {
                var channelView = markerView.channelView;
                var channelIndex = dataFrame.getValueIndexByChannel(channelView.channel);
                var value = values[channelIndex];
                markerView.value.set(value);
            });
        });
        updateVerticalPositions();
    }

    function updateVerticalPositions() {
        markerViews.forEach(function (markerView) {
            var value = markerView.value.get();
            var position = (value - chartCanvas.selection.position.y) * chartCanvas.size.y / chartCanvas.selection.size.y;
            markerView.position.set(position);
        });
        var limits = new LineSegment1(0, chartCanvas.size.y);
        resolveMarkerOverlap(markerViews, limits);
    }

    /**
     *
     * @param {ChannelView} channelView
     * @returns {Number}
     */
    function findMarkerIndex(channelView) {
        for (var i = 0, l = markerViews.length; i < l; i++) {
            var markerView = markerViews[i];
            if (markerView.channelView === channelView) {
                return i;
            }
        }
        return -1;
    }

    /**
     *
     * @param {ChannelView} channelView
     */
    function addMarker(channelView) {
        var markerView = new MarkerView(channelView);
        elMarkerContainer.appendChild(markerView.el);
        //remember for traversal
        markerViews.push(markerView);
    }

    /**
     *
     * @param {ChannelView} channelView
     */
    function removeMarker(channelView) {
        //find markerIndex view
        var markerIndex = findMarkerIndex(channelView);
        if (markerIndex === -1) {
            console.warn('failed to find removed channel view, ignoring');
            return;
        }

        var markerView = markerViews[markerIndex];
        //remove marker
        markerViews.splice(markerIndex, 1);

        elMarkerContainer.removeChild(markerView.el);
    }

    chartCanvas.channelViews.forEach(addMarker);
    chartCanvas.channelViews.on.added.add(addMarker);

    chartCanvas.channelViews.on.removed.add(removeMarker);

    updateValues();
    this.update();

    var boundUpdate = this.update.bind(this);

    function update() {
        boundUpdate();
        updateValues();
    }

    chartCanvas.selection.size.onChanged.add(update);
    chartCanvas.selection.position.onChanged.add(update);
    position.onChanged.add(boundUpdate);

    position.onChanged.add(updateValues);
};

CursorView.prototype.update = function () {
    var canvas = this.chartCanvas;
    //calculate position for the on-screen element
    var p0 = this.position.get() - canvas.selection.position.x;
    var p1 = p0 / canvas.selection.size.x;
    var p2 = p1 * canvas.size.x;

    this.el.style.left = p2 + 'px';
    this.el.style.top = 0 + 'px';
    this.el.style.height = canvas.size.y + 'px';
};

module.exports = CursorView;