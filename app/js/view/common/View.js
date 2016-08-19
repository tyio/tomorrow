/**
 * Created by Alex on 19/08/2016.
 */

"use strict";

var Vector2 = require('../../model/core/geom/Vector2');
var List = require('../../model/core/collection/List');

function View() {
    this.children = new List();
    this.position = new Vector2();
    this.size = new Vector2();

    var self = this;
    function setSize(x,y) {
        // var style = self.el.style;
        // style.width = x+"px";
        // style.height = y+"px";
    }

    function setPosition(x,y) {
        var style = self.el.style;
        style.left = x+"px";
        style.top = y+"px";
    }

    this.position.onChanged.add(setPosition);
    this.size.onChanged.add(setSize);

    function handleChildAdded(v) {
        self.el.appendChild(v.el);
    }

    function handleChildRemoved(v) {
        self.el.removeChild(v.el);
    }

    this.children.on.added.add(handleChildAdded);
    this.children.on.removed.add(handleChildRemoved);
}

module.exports = View;



