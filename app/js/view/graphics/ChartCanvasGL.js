/**
 * Created by Alex on 10/04/2016.
 */
'use strict';

var ChartCanvasGL = function (view) {
    this.view = view;
    this.channels = [];
};

ChartCanvasGL.prototype.paint = function (selection) {
    var view = this.view;

    var dataFrame = view.dataFrame;
    var channelViews = view.channelViews;

    //map channel views to record values
    var channelIndices = channelViews.map(function ( channelView ) {
        return dataFrame.getValueIndexByChannel(channelView.channel);
    });

    var channels = this.channels;
    var masterChannelPosition = dataFrame.getValueIndexByChannel(dataFrame.masterChannel);

    function paintSample( record ) {
        var masterValue = record[masterChannelPosition];
        for(var i=0; i< channels.length; i++){
            var channel = channels[i];
            var channelIndex = channelIndices[i];
            var value = record[channelIndex];
            channel.paintPoint(masterValue,value);
        }
    }

};

module.exports = ChartCanvasGL;