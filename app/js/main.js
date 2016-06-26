var DataType = require('./model/tomorrow/data/DataType');
var Channel = require('./model/tomorrow/channel/Channel');
var DataFrame = require('./model/tomorrow/data/DataFrame');
var Vector2 = require('./model/core/geom/Vector2');

var GraphBuilder = require('./model/tomorrow/GraphBuilder');

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
    var a = 0;
    var b = 3;
    var ad = 0.1;
    var bd = 0.03;
    var ad2 = ad / 2;
    var bd2 = bd / 2;
    table.addRows(numSamples, function (i, row) {
        row[0] = i / 100;
        a += Math.random() * ad - ad2;
        b += Math.random() * bd - bd2;
        row[1] = a;
        row[2] = b;
        row[3] = a - b;
    });
    console.timeEnd("generateData");
}

generateData(10000000, dataFrame.data);

var builder = new GraphBuilder();

var chart = builder.setSize(950, 600)
    .setSelection(0, -10, 100000, 20)
    .build(dataFrame);

document.body.appendChild(chart.el);