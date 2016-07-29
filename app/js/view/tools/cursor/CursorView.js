/**
 * Created by Alex on 29/07/2016.
 */

var ObservedValue = require('../../../model/core/math/ObservedValue');
var UniformSampler = require('../../../model/tomorrow/data/transform/UniformSampler');

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

                var position = (value - chartCanvas.selection.position.y) * chartCanvas.size.y / chartCanvas.selection.size.y;
                markerView.position.set(position);
            });
        });

    }

    function addMarker(channelView) {
        var markerView = new MarkerView(channelView);
        elMarkerContainer.appendChild(markerView.el);
        //remember for traversal
        markerViews.push(markerView);
    }

    chartCanvas.channelViews.forEach(addMarker);
    chartCanvas.channelViews.on.added.add(addMarker);
    updateValues();
    this.update();
    //TODO handle removal

    var boundUpdate = this.update.bind(this);

    chartCanvas.selection.size.onChanged.add(boundUpdate);
    chartCanvas.selection.position.onChanged.add(boundUpdate);
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