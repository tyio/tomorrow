/**
 * Created by Alex on 10/04/2016.
 */
var THREE = require( 'THREE' );

var ChannelGL = function ( channelView ) {
    this.view = channelView;

    // this.geometry = new THREE.Geometry();
    // this.geometry  = new THREE.PlaneGeometry( 5,5, 1, 1 );
    // this.geometry = new THREE.SphereGeometry( 5 );

    this.geometry = new THREE.BufferGeometry();
    this.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0),3));
    this.geometry.dynamic = true;

    var opacity = 1;
    this.material = new THREE.LineBasicMaterial( {
        color : channelView.style.color,
        opacity : opacity,
        linewidth : channelView.style.thickness
    } );

    // this.material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );

    this.mesh = new THREE.Line( this.geometry, this.material );
    this.mesh.frustumCulled = false;
    this.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Number.POSITIVE_INFINITY);
};

ChannelGL.prototype.clear = function () {
};

ChannelGL.prototype.paintStart = function ( sampleCount ) {

    this.__paintCursor = 0;
    var geometry = this.geometry;
    //check number of vertices
    var aPosition = geometry.getAttribute('position');
    if(aPosition.count < sampleCount){
        aPosition.array = new Float32Array(sampleCount*3);
    }
    this.__paintArray = aPosition.array;
};
ChannelGL.prototype.paintPoint = function ( x, y ) {

    var paintArray = this.__paintArray;
    var c = this.__paintCursor++;

    var i = c*3;
    paintArray[i] = x;
    paintArray[i+1] = y;
};

ChannelGL.prototype.paintFinish = function () {
    var geometry = this.geometry;

    var aPosition = geometry.getAttribute('position');
    aPosition.needsUpdate = true;

        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;

};

module.exports = ChannelGL;
