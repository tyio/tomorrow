/**
 * Created by Alex on 05/05/2016.
 */
var Rectangle = require( '../core/geom/Rectangle' );
var Vector2 = require( '../core/geom/Vector2' );

var AxisScale = require( './axis/AxisScale' );
var Axis = require( './axis/Axis' );

var AxisView = require( '../../view/axis/AxisView' );
var AxisScaleView = require( '../../view/axis/AxisScaleView' );

var Grid = require( './Grid' );
var GridView = require( '../../view/GridView' );

var Chart = require( '../../view/Chart' );
var ChartCanvas = require( '../../view/ChartCanvas' );

var ChannelView = require( '../../view/ChannelView' );
var ChannelStyle = require( '../../view/ChannelStyle' );

var Orientation = require( './axis/Orientation' );

var ColorUtils = require( '../core/ColorUtils' );

var InteractionController = require( '../input/InteractionController' );

var GraphBuilder = function () {
    this.selection = new Rectangle( 0, 0, 1, 10 );
    this.size = new Vector2( 800, 600 );
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {GraphBuilder}
 */
GraphBuilder.prototype.setSize = function ( x, y ) {
    this.size.set( x, y );
    return this;
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {GraphBuilder}
 */
GraphBuilder.prototype.setSelection = function ( x, y, width, height ) {
    this.selection.set( x, y, width, height );
    return this;
};

function buildAxisView( axis, orientation, size, selection ) {

    var scaleViews = axis.scales.map( function ( scale ) {
        return new AxisScaleView( {
            size : size,
            selection : selection,
            orientation : orientation,
            axisScale : scale
        } );
    } );

    var axisView = new AxisView( {
        size : size,
        selection : selection,
        orientation : orientation,
        axis : axis,
        axisScaleViews : scaleViews
    } );

    return axisView;
}

/**
 *
 * @param {Channel} channel
 * @returns {Axis}
 */
function buildAxis( channel ) {

    var scale = new AxisScale();

    scale.name = channel.name;
    scale.units = channel.unit;

    scale.markOffset = 1;
    scale.markStride = 1;
    scale.markStrideSkip = 0;
    scale.markStrideFill = 0;


    var axis = new Axis();
    axis.addScale( scale );

    return axis;
}

function registerInteractions( chart ) {
    var chartCanvas = chart.chartCanvas;
    var ic = new InteractionController( chartCanvas.el );
    ic.pointer.on.drag.add( function ( position, origin, delta ) {
        var size = chartCanvas.size;
        var selection = chartCanvas.selection;

        var scale = selection.size.clone().divide( size );

        var selectionDelta = delta.clone().multiply( scale );
        selectionDelta.x = -selectionDelta.x;

        selection.position.add( selectionDelta );
    } );
}

/**
 *
 * @param {DataFrame} dataFrame
 * @returns {Chart}
 */
GraphBuilder.prototype.build = function ( dataFrame ) {
    var channels = dataFrame.channels;

    var channelViews = channels.filter( function ( channel ) {
        //filter out master channel. We don't want to display it.
        return channel !== dataFrame.masterChannel;
    } ).map( function ( channel, index ) {
        var hue = index / (channels.length);
        var color = ColorUtils.hsv2rgb( hue, 0.7, 0.9 );

        var channelView = new ChannelView();
        channelView.channel = channel;
        channelView.style = new ChannelStyle();
        channelView.style.thickness = 1;
        channelView.style.lineStyle = 'solid';
        channelView.style.color = ColorUtils.rgb2hex( color.r, color.g, color.b );

        return channelView;
    } );

    var chartCanvas = new ChartCanvas( {
        size : this.size,
        selection : this.selection,
        dataFrame : dataFrame,
        channelViews : channelViews
    } );

    //use first two channels as X and Y axis respectively
    if ( channels.length < 2 ) {
        throw new Error( 'Insufficient number of channels to build graph, need at least 2' );
    }

    //build axis
    var c0 = dataFrame.masterChannel;
    var c1 = channels[ 1 ];

    var a0 = buildAxis( c0 );
    var a1 = buildAxis( c1 );

    var av0 = buildAxisView( a0, Orientation.HORIZONTAL, this.size, this.selection );
    var av1 = buildAxisView( a1, Orientation.VERTICAL, this.size, this.selection );

    var grid = new Grid();
    grid.addXAxisScale( a0.scales[ 0 ] );
    grid.addYAxisScale( a1.scales[ 0 ] );

    var gridView = new GridView();
    gridView.grid = grid;

    var chart = new Chart();
    chart.gridView = gridView;
    chart.selection = this.selection;
    chart.setChartCanvas( chartCanvas );

    chart.addAxisView( av0 );
    chart.addAxisView( av1 );

    registerInteractions( chart );

    return chart;
};

module.exports = GraphBuilder;