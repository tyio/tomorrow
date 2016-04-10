var Channel = require( './model/tomorrow/Channel');
var DataFrame = require( './model/tomorrow/DataFrame');

var Chart = require( './view/Chart');
var ChartCanvas = require( './view/ChartCanvas');
var ChannelView = require( './view/ChannelView');
var ChannelStyle = require( './view/ChannelStyle');


var channel = new Channel();
channel.name = 'a';
channel.unit = 's';
channel.dataType = 'int';

var dataFrame = new DataFrame();
dataFrame.addChannel(channel);
var masterChannel = dataFrame.setMasterChannel(channel.id);

dataFrame.data.addRow([0]);
dataFrame.data.addRow([1]);
dataFrame.data.addRow([2]);
dataFrame.data.addRow([3]);
dataFrame.data.addRow([4]);
dataFrame.data.addRow([5]);

var channelView = new ChannelView();
channelView.channel = channel;
channelView.style = new ChannelStyle();
channelView.style.thickness = 1;
channelView.style.lineStyle = 'solid';
channelView.style.color = '#800080';
channelView.style.color = '#800080';

var chartCanvas = new ChartCanvas();
chartCanvas.dataFrame = dataFrame;
chartCanvas.channelViews.push(channelView);

var chart = new Chart();
chart.chartCanvas = chartCanvas;
