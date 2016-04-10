var DataType = require( './model/tomorrow/DataType');
var Channel = require( './model/tomorrow/Channel');
var DataFrame = require( './model/tomorrow/DataFrame');
var Grid = require( './model/tomorrow/Grid');
var Axis = require( './model/tomorrow/Axis');
var AxisScale = require( './model/tomorrow/AxisScale');
var Rectangle = require( './model/core/geom/Rectangle');
var Vector2 = require( './model/core/geom/Vector2');

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

dataFrame.data.addRow([0, 10]);
dataFrame.data.addRow([1, 20]);
dataFrame.data.addRow([2, 10]);
dataFrame.data.addRow([3, 20]);
dataFrame.data.addRow([4, 10]);

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

var selection = new Rectangle(0, 0, 10, 10);
var chartCanvas = new ChartCanvas({
    size: new Vector2(800, 600),
    selection: selection,
    dataFrame: dataFrame,
    channelViews: [channelView]
});

var timeAxisScaleView = new AxisScaleView({
    axisScale: timeAxisScale
});
var timeAxisView = new AxisView({
    axis: timeAxis,
    axisScaleViews: [timeAxisScaleView]
});

var temperatureAxisScaleView = new AxisScaleView({
    axisScale: temperatureAxisScale
});

var temperatureAxisView = new AxisView({
    axis: temperatureAxis,
    axisScaleViews: [temperatureAxisScaleView]
});

var gridView = new GridView();
gridView.grid = grid;

var chart = new Chart();
chart.gridView = gridView;
chart.selection = selection;
chart.setChartCanvas(chartCanvas);
chart.addXAxisView(timeAxisView);
chart.addYAxisView(temperatureAxisView);

document.body.appendChild(chart.el);