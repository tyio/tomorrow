/**
 * Created by Alex on 10/04/2016.
 */
var THREE = require('THREE');

var ChannelGL = function ( channelView ) {
    this.geometry = new THREE.Geometry();
    var opacity = 1;
    this.material = new THREE.LineBasicMaterial({color: channelView.style.color, opacity: opacity, linewidth: channelView.style.thickness});
    this.view = channelView;
};

ChannelGL.prototype.clear = function (  ) {

};

ChannelGL.prototype.paintStart = function (  ) {

};
ChannelGL.prototype.paintPoint = function ( x, y ) {

};

ChannelGL.prototype.paintFinish = function () {

};

module.exports = ChannelGL;
