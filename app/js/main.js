var DataType = require('./model/tomorrow/data/DataType');
var Channel = require('./model/tomorrow/channel/Channel');
var DataFrame = require('./model/tomorrow/data/DataFrame');
var Vector2 = require('./model/core/geom/Vector2');

var GraphBuilder = require('./model/tomorrow/GraphBuilder');

var RandomGeneratorOrder2 = require('./model/tomorrow/data/generators/RandomGeneratorOrder2');
var LinearGenerator = require('./model/tomorrow/data/generators/LinearGenerator');

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
    var g0 = new RandomGeneratorOrder2(0, 0, 0.005, 0.1);
    var g1 = new RandomGeneratorOrder2(1, 0, 0.0013, 0.001);
    var g2 = new RandomGeneratorOrder2(2, 0, 0.0014, 0.005);

    var masterStep = 1/100;
    table.addRows(numSamples, function (i, row) {
        row[0] = i *masterStep;
        row[1] = g0.next(masterStep);
        row[2] = g1.next(masterStep);
        row[3] = g2.next(masterStep);
    });
    console.timeEnd("generateData");
}

function startContinuousDataGeneration(table, samplesPerSecond) {
    var period = 1 / samplesPerSecond;
    var smallestTickInterval = 15 / 1000;

    var startSample = [];
    table.getRow(table.length-1, startSample);

    var generators = startSample.map(function (value, index) {
        if (index === 0) {
            //master
            return new LinearGenerator(value, 1);
        } else {
            return new RandomGeneratorOrder2(value, 0, 0.005, 0.1);
        }
    });
    var generatedSample = [];

    function makeSample(dt) {
        for (var i = 0, l = generators.length; i < l; i++) {
            var generator = generators[i];
            generatedSample[i] = generator.next(dt);
        }
        table.addRow(generatedSample);
    }

    var slackSamples = 0;
    var lastSampleTime = Date.now();
    if (period < smallestTickInterval) {
        setInterval(function () {
            var timeNow = Date.now();
            var timeDelta = (timeNow - lastSampleTime) / 1000;
            var numToGen = timeDelta * samplesPerSecond + slackSamples;

            var sampleTimeDelta = timeDelta / numToGen;
            for (var i = 0; i < numToGen; i++) {
                makeSample(sampleTimeDelta);
            }
            slackSamples = numToGen % 1;

            lastSampleTime = timeNow;
        }, smallestTickInterval);
    } else {
        setInterval(function () {
            var timeNow = Date.now();
            var timeDelta = (timeNow - lastSampleTime) / 1000;
            makeSample(timeDelta);
            lastSampleTime = timeNow;
        }, period * 1000);
    }
}

generateData(1000, dataFrame.data);

var builder = new GraphBuilder();

var chart = builder.setSize(950, 600)
    .setSelection(0, 0, 100, 5)
    .build(dataFrame);

startContinuousDataGeneration(dataFrame.data, 1000);

document.body.appendChild(chart.el);
