var DataType = require('./model/tomorrow/data/DataType');
var Channel = require('./model/tomorrow/channel/Channel');
var DataFrame = require('./model/tomorrow/data/DataFrame');
var Vector2 = require('./model/core/geom/Vector2');

var GraphBuilder = require('./model/tomorrow/GraphBuilder');

var RandomGeneratorOrder2 = require('./model/tomorrow/data/generators/RandomGeneratorOrder2');

var time = new Channel();
time.name = 'time';
time.unit = 's';
time.dataType = DataType.Float32;

var channel1 = new Channel();
channel1.name = 'Milk';
channel1.unit = 'pint';
channel1.dataType = DataType.Int8;

var channel2 = new Channel();
channel2.name = 'Eggs';
channel2.unit = 'item';
channel2.dataType = DataType.Float32;

var channel3 = new Channel();
channel3.name = 'Kittens';
channel3.unit = 'fluff';
channel3.dataType = DataType.Float32;

var dataFrame = new DataFrame([time, channel1, channel2, channel3], time);

function generateData(numSamples, table) {
    console.time("generateData");
    var g0 = new RandomGeneratorOrder2(0, 0, 0.000000005, 0.1);
    var g1 = new RandomGeneratorOrder2(3, 0, 0.0000000013, 0.001);
    var g2 = new RandomGeneratorOrder2(7, 0, 0.0000000014, 0.005);
    table.addRows(numSamples, function (i, row) {
        row[0] = i / 100;
        row[1] = g0.next();
        row[2] = g1.next();
        row[3] = g2.next();
    });
    console.timeEnd("generateData");
}

generateData(10000000, dataFrame.data);

var builder = new GraphBuilder();

var chart = builder.setSize(950, 600)
    .setSelection(0, -10, 100000, 20)
    .build(dataFrame);

document.body.appendChild(chart.el);