var DataType = require( './model/tomorrow/data/DataType' );
var Channel = require( './model/tomorrow/channel/Channel' );
var DataFrame = require( './model/tomorrow/data/DataFrame' );
var Vector2 = require( './model/core/geom/Vector2' );

var GraphBuilder = require( './model/tomorrow/GraphBuilder' );

var time = new Channel();
time.name = 'time';
time.unit = 's';
time.dataType = DataType.Float32;

var temperature = new Channel();
temperature.name = 'temperature';
temperature.unit = 'C';
temperature.dataType = DataType.Int8;

var temperature2 = new Channel();
temperature2.name = 'temperature2';
temperature2.unit = 'C';
temperature2.dataType = DataType.Int8;
var dataFrame = new DataFrame( [ time, temperature,temperature2 ], time );

function generateData( numSamples, table ) {
    console.time( "generateData" );
    table.addRows(numSamples,function (i,row) {
        row[ 0 ] = i / 100;
        row[ 1 ] = Math.random() * 10;
        row[ 2 ] = Math.random() * 6 +5;
    });
    console.timeEnd( "generateData" );
}

generateData( 10000000, dataFrame.data );

var builder = new GraphBuilder();

var chart = builder.setSize( 950, 600 )
    .setSelection(0, 0, 30, 10)
    .build( dataFrame );

document.body.appendChild( chart.el );