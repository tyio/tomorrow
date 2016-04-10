/**
 * Created by Alex on 10/04/2016.
 */
'use strict';

var THREE = require( 'THREE' );
var ChannelGL = require( './ChannelGL' );

var ChartCanvasGL = function ( view ) {
    this.view = view;
    this.channels = [];

    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera( -1 / 2, 1 / 2, 1 / 2. - 1 / 2, 1, 100 );

    var renderer = this.renderer = new THREE.WebGLRenderer( {antialias : true} );
    renderer.setPixelRatio( window.devicePixelRatio );

    renderer.setClearColor( 0, 0 );

    renderer.setSize( view.size.x, view.size.y );

    var channelViews = view.channelViews;
    for ( var i = 0; i < channelViews.length; i++ ) {
        var channelView = channelViews[ i ];
        this.addChannelView( channelView );
    }

    this.updateCamera();

    var self = this;

    function handleSelectionChange() {
        self.updateCamera();
        self.paint();
        self.render();
    }

    view.selection.position.onChanged.add( handleSelectionChange );
    view.selection.size.onChanged.add( handleSelectionChange );

    this.el = renderer.domElement;
};

ChartCanvasGL.prototype.updateCamera = function () {
    var size = this.view.selection.size;
    var camera = this.camera;

    camera.left = -size.x / 2;
    camera.right = size.x / 2;
    camera.top = size.y / 2;
    camera.bottom = -size.y / 2;
    camera.updateProjectionMatrix();
};

ChartCanvasGL.prototype.addChannelView = function ( view ) {
    var channelGL = new ChannelGL( view );
    this.channels.push( channelGL );
    this.scene.add( channelGL.mesh );
};

ChartCanvasGL.prototype.render = function () {
    this.renderer.render( this.scene, this.camera );
};

/**
 *
 * @param {Rectangle} selection
 */
ChartCanvasGL.prototype.paint = function ( selection ) {
    var view = this.view;

    var dataFrame = view.dataFrame;
    var channelViews = view.channelViews;

    //map channel views to record values
    var channelIndices = channelViews.map( function ( channelView ) {
        return dataFrame.getValueIndexByChannel( channelView.channel );
    } );

    var channels = this.channels;
    var masterChannelPosition = dataFrame.getValueIndexByChannel( dataFrame.masterChannel );

    function paintSample( record ) {
        var masterValue = record[ masterChannelPosition ];
        for ( var i = 0; i < channels.length; i++ ) {
            var channel = channels[ i ];
            var channelIndex = channelIndices[ i ];
            var value = record[ channelIndex ];
            channel.paintPoint( masterValue, value );
        }
    }

    function paintStart( sampleCount ) {
        for ( var i = 0, l = channels.length; i < l; i++ ) {
            var channel = channels[ i ];
            channel.paintStart( sampleCount );
        }
    }

    function paintFinish() {
        for ( var i = 0, l = channels.length; i < l; i++ ) {
            var channel = channels[ i ];
            channel.paintFinish();
        }
    }

    //find first record index for selection
    var lowMasterIndex = dataFrame.findLowRecordIndexByMasterValue( selection.position.x );
    var highMasterIndex = dataFrame.findHighRecordIndexByMasterValue( selection.position.x + selection.size.x );

    var sampleCount = highMasterIndex - lowMasterIndex;
    //render
    paintStart( sampleCount );
    var record = [];
    for ( var i = lowMasterIndex; i <= highMasterIndex; i++ ) {
        dataFrame.data.getRow( i, record );
        paintSample( record );
    }
    paintFinish();
};

module.exports = ChartCanvasGL;