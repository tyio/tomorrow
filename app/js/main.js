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

var dataFrame = new DataFrame( [ time, temperature ], time );

function generateData( numSamples, table ) {
    console.time( "generateData" );
    var row = [];
    for ( var i = 0; i < numSamples; i++ ) {
        row[ 0 ] = i / 100;
        row[ 1 ] = Math.random() * 10;
        table.addRow( row );
    }
    console.timeEnd( "generateData" );
}

generateData( 1000, dataFrame.data );

var builder = new GraphBuilder();

var chart = builder.setSize( 800, 600 )
    .setSelection( 0, 0, 5, 10)
    .build( dataFrame );

document.body.appendChild( chart.el );