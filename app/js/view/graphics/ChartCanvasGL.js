/**
 * Created by Alex on 10/04/2016.
 */
'use strict';

var THREE = require('THREE');
var ChannelGL = require('./ChannelGL');
var UniformSampler = require('../../model/tomorrow/data/transform/UniformSampler');

var BucketTraver = require('../../model/tomorrow/data/transform/BucketTraver');

var ChartCanvasGL = function (view) {
    this.sampler = new BucketTraver(0);
    this.view = view;
    this.channels = [];

    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-1 / 2, 1 / 2, 1 / 2, -1 / 2, 1, 100);
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 1));

    var renderer = this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setClearColor(0, 0);

    function handleViewSizeChange(x, y) {
        renderer.setSize(x, y);
    }

    view.size.react(handleViewSizeChange);

    var channelViews = view.channelViews;
    for (var i = 0; i < channelViews.length; i++) {
        var channelView = channelViews.get(i);
        this.addChannelView(channelView);
    }

    this.updateCamera();

    var self = this;

    function handleSelectionChange() {
        self.__cameraNeedsUpdate = true;
        self.__needsRepaint = true;
    }

    var selection = view.selection;
    selection.position.onChanged.add(handleSelectionChange);
    selection.size.onChanged.add(handleSelectionChange);

    var masterSignalIndex = view.dataFrame.getValueIndexByChannel(view.dataFrame.masterChannel);

    function handleSampleAdded(index, values) {
        //check if master signal value is in selection range
        var masterSignalValue = values[masterSignalIndex];
        if (masterSignalValue >= selection.position.x && masterSignalValue <= selection.position.x + selection.size.x) {
            //record in selection range
            self.__needsRepaint = true;
        }
    }

    view.dataFrame.data.on.added.add(handleSampleAdded);

    this.el = renderer.domElement;

    function updateView() {
        if (self.__needsRepaint) {
            self.paint(selection);
            self.__needsRepaint = false;
        }
        self.render();
        requestAnimationFrame(updateView);
    }

    handleSelectionChange();
    updateView();

    //repaint flag
    this.__needsRepaint = true;
    //camera update flag
    this.__cameraNeedsUpdate = true;
    //flag for rerendering
    this.__renderDirty = true;
};

ChartCanvasGL.prototype.updateCamera = function () {
    var selection = this.view.selection;
    var size = selection.size;
    var camera = this.camera;

    camera.left = 0;
    camera.right = -size.x;
    camera.top = size.y;
    camera.bottom = 0;

    camera.near = 0;
    camera.far = 100;

    camera.position.set(selection.position.x, selection.position.y, -1);

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    this.__cameraNeedsUpdate = false;
    //mark for update
    this.__renderDirty = true;
};

ChartCanvasGL.prototype.addChannelView = function (view) {
    var channelGL = new ChannelGL(view);
    this.channels.push(channelGL);
    this.scene.add(channelGL.mesh);
};

ChartCanvasGL.prototype.render = function () {
    if (this.__cameraNeedsUpdate) {
        this.updateCamera();
    }
    if (this.__renderDirty) {
        this.renderer.render(this.scene, this.camera);

        this.__renderDirty = false;
    }
};

/**
 *
 * @param {Rectangle} selection
 */
ChartCanvasGL.prototype.paint = function (selection) {
    var view = this.view;

    var dataFrame = view.dataFrame;
    var channelViews = view.channelViews;

    //map channel views to record values
    var channelIndices = channelViews.map(function (channelView) {
        return dataFrame.getValueIndexByChannel(channelView.channel);
    });

    var channels = this.channels;
    var masterChannelPosition = dataFrame.getValueIndexByChannel(dataFrame.masterChannel);

    function paintSample(recordMin, recordMax) {
        var masterValue = recordMin[masterChannelPosition];
        for (var i = 0; i < channels.length; i++) {
            var channel = channels[i];
            var channelIndex = channelIndices[i];
            var valueMin = recordMin[channelIndex];
            var valueMax = recordMax[channelIndex];
            channel.paintPoint(masterValue, valueMin,valueMax);
        }
    }

    function paintStart(sampleCount) {
        for (var i = 0, l = channels.length; i < l; i++) {
            var channel = channels[i];
            channel.paintStart(sampleCount);
        }
    }

    function paintFinish() {
        for (var i = 0, l = channels.length; i < l; i++) {
            var channel = channels[i];
            channel.paintFinish();
        }
    }

    var sampler = this.sampler;
    sampler.bucketSize = selection.size.x / (this.view.size.x);

    var sampleCountUpperBound = (selection.size.x / sampler.bucketSize) + 2;

    //render
    paintStart(sampleCountUpperBound);
    var startValue = selection.position.x;
    var endValue = selection.position.x + selection.size.x;

    function doSample() {
        var min = [];
        var max = [];

        var sample = [];

        var first = true;

        function visitSample(row) {

            var i, l;
            for (i = 0, l = row.length; i < l; i++) {
                min[i] = Math.min(min[i], row[i]);
                max[i] = Math.max(max[i], row[i]);
            }
        }

        function visitBucketStart(masterValue, sampleCount) {
            if (sampleCount === 0) {
                //nothing here, skip
                return;
            }

            var i, l;
            if (first) {
                first = false;
            } else {
                sample[masterChannelPosition] = masterValue;
                for (i = 0, l = channels.length; i < l; i++) {
                    var channelIndex = channelIndices[i];
                    sample[channelIndex] = (min[channelIndex] + max[channelIndex]) / 2;
                }
                paintSample(min,max)
            }
            for (i = 0, l = min.length; i < l; i++) {
                min[i] = Number.POSITIVE_INFINITY;
                max[i] = Number.NEGATIVE_INFINITY;
            }
        }

        sampler.traverse(dataFrame, startValue, endValue, visitSample, visitBucketStart);
    }

    doSample();
    paintFinish();

    //flag for re-rendering
    this.__renderDirty = true;
};

module.exports = ChartCanvasGL;