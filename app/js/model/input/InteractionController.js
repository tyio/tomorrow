/**
 * Created by Alex on 05/05/2016.
 */

var List = require('../core/collection/List');
var Signal = require('../core/Signal');
var Vector2 = require('../core/geom/Vector2');

/**
 *
 * @param {Node|Array.<Node>|List} [options]
 * @constructor
 */
var InteractionController = function (options) {
    this.elements = new List();

    var pointer = this.pointer = {
        on: {
            down: new Signal(),
            up: new Signal(),
            move: new Signal(),
            tap: new Signal(),
            drag: new Signal(),
            mouseWheel: new Signal()
        }
    };

    function makeV2FromPointerEvent(event) {
        return new Vector2(event.clientX, event.clientY)
    }

    function handleDomEventMouseDown(event) {
        pointer.on.down.dispatch(makeV2FromPointerEvent(event));
    }

    function handleDomEventMouseUp(event) {
        pointer.on.up.dispatch(makeV2FromPointerEvent(event));
    }

    function handleDomEventMouseMove(event) {
        event.preventDefault();
        pointer.on.move.dispatch(makeV2FromPointerEvent(event));
    }

    function handleDomEventWheel(event) {
        event.preventDefault();
        pointer.on.mouseWheel.dispatch(makeV2FromPointerEvent(event), event.deltaX, event.deltaY, event.deltaZ);
    }

    function link(domElement) {
        domElement.addEventListener('mousedown', handleDomEventMouseDown);
        domElement.addEventListener('mouseup', handleDomEventMouseUp);
        domElement.addEventListener('mousemove', handleDomEventMouseMove);
        domElement.addEventListener('wheel', handleDomEventWheel);
    }

    function unlink(domElement) {
        domElement.removeEventListener('mousedown', handleDomEventMouseDown);
        domElement.removeEventListener('mouseup', handleDomEventMouseUp);
        domElement.removeEventListener('mousemove', handleDomEventMouseMove);
        domElement.removeEventListener('wheel', handleDomEventWheel);
    }

    this.elements.on.added.add(function (elements) {
        elements.forEach(link);
    });

    this.elements.on.removed.add(function (elements) {
        elements.forEach(unlink);
    });

    //process arguments
    if (options instanceof Node) {
        this.elements.add(options);
    } else if (options instanceof Array) {
        this.elements.addAll(options);
    } else if (options instanceof List) {
        this.elements.addAll(options.data);
    }

    //
    this.registerComplexEvents();
};

InteractionController.prototype.registerComplexEvents = function () {
    var pointer = this.pointer;

    function handleEnd() {
        window.removeEventListener('mouseup', handleEnd);
        pointer.on.move.remove(handleMove);
        if (!movedSinceDown) {
            //it's a tap
            pointer.on.tap.dispatch(pointerDownPosition);
        }
    }

    function handleMove(p) {
        movedSinceDown = true;
        var delta = p.clone().sub(pointerDragPositionLast);
        pointerDragPositionLast.copy(p);
        pointer.on.drag.dispatch(p, pointerDownPosition, delta);
    }

    var movedSinceDown = false;

    var pointerDragPositionLast = new Vector2();
    var pointerDownPosition = new Vector2();

    pointer.on.down.add(function (v2) {
        movedSinceDown = false;
        pointerDownPosition.copy(v2);
        pointerDragPositionLast.copy(v2);
        window.addEventListener('mouseup', handleEnd);
        pointer.on.move.add(handleMove);
    });
};


module.exports = InteractionController;