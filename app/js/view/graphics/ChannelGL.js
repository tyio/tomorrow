/**
 * Created by Alex on 10/04/2016.
 */
var THREE = require( 'THREE' );

var ChannelGL = function ( channelView ) {
    this.view = channelView;

    this.geometry = new THREE.BufferGeometry();
    this.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0),3));
    this.geometry.dynamic = true;

    var opacity = 1;
    this.material = new THREE.LineBasicMaterial( {
        color : channelView.style.color,
        opacity : opacity,
        linewidth : channelView.style.thickness
    } );

    this.mesh = new THREE.Line( this.geometry, this.material );
    this.mesh.frustumCulled = false;
    this.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Number.POSITIVE_INFINITY);
};

ChannelGL.prototype.clear = function () {
};

ChannelGL.prototype.resizeVertexCache = function ( requiredCount ) {
    var aPosition = this.geometry.getAttribute('position');
    function setSize( x ) {
        aPosition.array = new Float32Array(x*3);
        aPosition.count = x;
    }
    var growFactor = 1.3; //pre-allocates extra
    var shrinkFactor = 0.5; //reserves unused

    if(aPosition.count < requiredCount){
        //grow
        setSize(requiredCount*growFactor);
    }else if(aPosition.count*shrinkFactor > requiredCount + 1){
        setSize(requiredCount);
    }
};

ChannelGL.prototype.paintStart = function ( sampleCount ) {
    this.__paintCursor = 0;
    var geometry = this.geometry;
    //check number of vertices
    var aPosition = geometry.getAttribute('position');
    this.resizeVertexCache(sampleCount);
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
