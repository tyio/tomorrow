/**
 * Created by Alex on 10/04/2016.
 */
var THREE = require( 'THREE' );

var ChannelGL = function ( channelView ) {
    this.view = channelView;

    this.geometry = new THREE.Geometry();
    var opacity = 1;
    this.material = new THREE.LineBasicMaterial( {
        color : channelView.style.color,
        opacity : opacity,
        linewidth : channelView.style.thickness
    } );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
};

ChannelGL.prototype.clear = function () {
    //FIXME this needs to be done via static allocation instead
    this.geometry.vertices = [];
};

ChannelGL.prototype.paintStart = function ( sampleCount ) {
    this.clear();
};
ChannelGL.prototype.paintPoint = function ( x, y ) {
    this.geometry.vertices.push( new THREE.Vector3( x, y, 1 ) );
};

ChannelGL.prototype.paintFinish = function () {

};

module.exports = ChannelGL;
