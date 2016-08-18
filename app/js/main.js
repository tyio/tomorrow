var DataType = require('./model/tomorrow/data/DataType');
var Channel = require('./model/tomorrow/channel/Channel');
var DataFrame = require('./model/tomorrow/data/DataFrame');
var Vector2 = require('./model/core/geom/Vector2');

var GraphBuilder = require('./model/tomorrow/GraphBuilder');

var RandomGeneratorOrder2 = require('./model/tomorrow/data/generators/RandomGeneratorOrder2');
var LinearGenerator = require('./model/tomorrow/data/generators/LinearGenerator');
var SineWaveGenerator = require('./model/tomorrow/data/generators/SineWaveGenerator');

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

function makeSampleGenerators(table) {
    var offset = 0;
    return table.types.map(function (t, index) {
        if (index === 0) {
            //master
            return new LinearGenerator(0, 1);
        } else {
            var period = Math.random() * 10 + 1;
            var amplitude = Math.random() * 10 + 1;
            var phase = Math.random();

            var result = new SineWaveGenerator(period, amplitude, phase, offset+amplitude);
            offset += amplitude*2;
            return result;
        }
    });
}

function generateData(numSamples, table, generators) {
    console.time("generateData");
    var masterStep = 1 / 100;
    var rowLength = table.types.length;
    //check if there's enough generators
    if (generators.length < rowLength) {
        throw new Error("Not enough generators. Need " + rowLength + ", have " + generators.length);
    }

    table.addRows(numSamples, function (i, row) {
        for (var j = 0; j < rowLength; j++) {
            row[j] = generators[j].next(masterStep);
        }
    });
    console.timeEnd("generateData");
}

function startContinuousDataGeneration(table, samplesPerSecond, generators) {
    var period = 1 / samplesPerSecond;
    var smallestTickInterval = 15 / 1000;

    var startSample = [];
    table.getRow(table.length - 1, startSample);

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

            var wholeSamples = numToGen | 0;

            var sampleTimeDelta = timeDelta / wholeSamples;
            for (var i = 0; i < wholeSamples; i++) {
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

var generators = makeSampleGenerators(dataFrame.data);

generateData(1000, dataFrame.data, generators);

var builder = new GraphBuilder();

var chart = builder.setSize(950, 600)
    .setSelection(0, 0, 10, 5)
    .build(dataFrame);

startContinuousDataGeneration(dataFrame.data, 24, generators);

document.body.appendChild(chart.el);
