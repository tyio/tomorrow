var DataType = require( './model/tomorrow/DataType');
var Channel = require( './model/tomorrow/Channel');
var DataFrame = require( './model/tomorrow/DataFrame');
var Grid = require( './model/tomorrow/Grid');
var Axis = require( './model/tomorrow/Axis');
var AxisScale = require( './model/tomorrow/AxisScale');
var Rectangle = require( './model/core/geom/Rectangle');
var Vector2 = require( './model/core/geom/Vector2');
var Orientation = require( './model/tomorrow/Orientation');

var Chart = require( './view/Chart');
var ChartCanvas = require( './view/ChartCanvas');
var ChannelView = require( './view/ChannelView');
var ChannelStyle = require( './view/ChannelStyle');
var GridView = require( './view/GridView');
var AxisView = require( './view/AxisView');
var AxisScaleView = require( './view/AxisScaleView');

var time = new Channel();
time.name = 'time';
time.unit = 's';
time.dataType = DataType.Int8;

var temperature = new Channel();
temperature.name = 'temperature';
temperature.unit = 'C';
temperature.dataType = DataType.Int8;

var dataFrame = new DataFrame();
dataFrame.addChannel(time);
dataFrame.addChannel(temperature);
dataFrame.setMasterChannel(time);

for (var i = 0; i < 1000; i++) {
    dataFrame.data.addRow([i, Math.random() * 10]);
}

var timeAxisScale = new AxisScale();
timeAxisScale.name = time.name;
timeAxisScale.units = time.unit;
timeAxisScale.markOffset = 1;
timeAxisScale.markStride = 1;
timeAxisScale.markStrideSkip = 0;
timeAxisScale.markStrideFill = 0;

var temperatureAxisScale = new AxisScale();
temperatureAxisScale.name = temperature.name;
temperatureAxisScale.units = temperature.unit;
temperatureAxisScale.markOffset = 1;
temperatureAxisScale.markStride = 1;
temperatureAxisScale.markStrideSkip = 0;
temperatureAxisScale.markStrideFill = 0;

var timeAxis = new Axis();
timeAxis.addScale(timeAxisScale);

var temperatureAxis = new Axis();
temperatureAxis.addScale(temperatureAxisScale);

var grid = new Grid();
grid.addXAxisScale(timeAxisScale);
grid.addYAxisScale(temperatureAxisScale);

/////////////////////////////////////////////
var channelView = new ChannelView();
channelView.channel = temperature;
channelView.style = new ChannelStyle();
channelView.style.thickness = 1;
channelView.style.lineStyle = 'solid';
channelView.style.color = '#800080';

var selection = new Rectangle(0, 0, 1000, 10);
var size = new Vector2(800, 600);

var chartCanvas = new ChartCanvas({
    size: size,
    selection: selection,
    dataFrame: dataFrame,
    channelViews: [channelView]
});

var timeAxisScaleView = new AxisScaleView({
    size: size,
    selection: selection,
    orientation: Orientation.HORIZONTAL,
    axisScale: timeAxisScale
});
var timeAxisView = new AxisView({
    size: size,
    selection: selection,
    orientation: Orientation.HORIZONTAL,
    axis: timeAxis,
    axisScaleViews: [timeAxisScaleView]
});

var temperatureAxisScaleView = new AxisScaleView({
    size: size,
    selection: selection,
    orientation: Orientation.VERTICAL,
    axisScale: temperatureAxisScale
});

var temperatureAxisView = new AxisView({
    size: size,
    selection: selection,
    orientation: Orientation.VERTICAL,
    axis: temperatureAxis,
    axisScaleViews: [temperatureAxisScaleView]
});

var gridView = new GridView();
gridView.grid = grid;

var chart = new Chart();
chart.gridView = gridView;
chart.selection = selection;
chart.setChartCanvas(chartCanvas);
chart.addAxisView(timeAxisView);
chart.addAxisView(temperatureAxisView);

document.body.appendChild(chart.el);