var DataType = require( './model/tomorrow/DataType');
var Channel = require( './model/tomorrow/Channel');
var DataFrame = require( './model/tomorrow/DataFrame');
var Grid = require( './model/tomorrow/Grid');
var Axis = require( './model/tomorrow/Axis');
var AxisScale = require( './model/tomorrow/AxisScale');

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
var masterChannel = dataFrame.setMasterChannel(time.id);

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

var horizontalAxis = new Axis();
horizontalAxis.addScale(timeAxisScale);

var verticalAxis = new Axis();
verticalAxis.addScale(temperatureAxisScale);

var grid = new Grid();
grid.addXAxisScale(timeAxisScale);
grid.addYAxisScale(temperatureAxisScale);

var channelView = new ChannelView();
channelView.channel = time;
channelView.style = new ChannelStyle();
channelView.style.thickness = 1;
channelView.style.lineStyle = 'solid';
channelView.style.color = '#800080';
channelView.style.color = '#800080';

var chartCanvas = new ChartCanvas();
chartCanvas.dataFrame = dataFrame;
chartCanvas.channelViews.push(channelView);

var horizontalAxisView = new AxisView();

var gridView = new GridView();
gridView.grid = grid;

var chart = new Chart();
chart.chartCanvas = chartCanvas;
chart.gridView = gridView;
