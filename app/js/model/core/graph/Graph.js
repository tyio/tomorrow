/**
 * Created by Alex on 29/01/14.
 */
var Signal = require( '../core/Signal' );

/**
 * @callback Graph~visitor
 * @param {*} node
 * @param {Edge} edge
 * @returns {boolean|undefined} if false is returned, traversal should stop
 */

"use strict";
var Graph = function () {
    this.nodes = [];
    this.edges = [];
    this.onChange = new Signal();
};

/**
 *
 * @param start
 * @param goal
 * @returns {Array.<*>} nodes from start to goal in the shortest path including both start and goal.
 */
Graph.prototype.findPath = function ( start, goal ) {
    var open = new Set();
    open.add( start );

    var closed = new Set();

    var cameFrom = new Map();

    function constructPath() {
        var result = [];
        var c = goal;
        do {
            result.unshift( c );
            c = cameFrom.get( c );
        } while (c !== undefined);

        return result;
    }

    var graph = this;
    function expandNode( current ) {
        graph.traverseSuccessors( current, function ( node, edge ) {
            if ( closed.has( node ) ) {
                return;
            }
            if ( open.has( node ) ) {
                return;
            }
            open.add( node );
            cameFrom.set( node, current );
        } );
    }

    while (open.size > 0) {
        var current = open.values().next().value;
        if ( current === goal ) {
            //reached the goal
            return constructPath();
        }
        open.delete( current );
        closed.add( current );

        //expand node
        expandNode(current);
    }

    //no path found
    return null;
};

/**
 * Returns true if there is an edge between two given nodes on this graph
 */
Graph.prototype.isEdgeBetween = function ( node1, node2 ) {
    if ( !this.containsNode( node1 ) || !this.containsNode( node2 ) ) {
        return false; // one or both nodes are not part of the graph
    }
    var connectingEdge = this.findConnectingEdge( node1, node2 );
    return connectingEdge != null;
};

/**
 *
 * @param {*} node
 * @param {Graph~visitor} visitor
 */
Graph.prototype.traverseSuccessors = function ( node, visitor ) {
    var edges = this.edges;
    for ( var i = 0, l = edges.length; i < l; i++ ) {
        var edge = edges[ i ];
        var first = edge.first;
        var second = edge.second;

        if ( first === node && edge.directionForward ) {
            if ( visitor( second, edge ) === false ) {
                //terminate traversal if visitor returns false
                return;
            }
        } else if ( second === node && edge.directionBackward ) {
            if ( visitor( first, edge ) === false ) {
                //terminate traversal if visitor returns false
                return;
            }
        }
    }
};
/**
 *
 * @param {*} node
 * @param {Graph~visitor} visitor
 */
Graph.prototype.traverseAttachedEdges = function ( node, visitor ) {
    var edges = this.edges;
    for ( var i = 0, l = edges.length; i < l; i++ ) {
        var edge = edges[ i ];
        var first = edge.first;
        var second = edge.second;

        if ( first === node ) {
            if ( visitor( second, edge ) === false ) {
                //terminate traversal if visitor returns false
                return;
            }
        } else if ( second === node ) {
            if ( visitor( first, edge ) === false ) {
                //terminate traversal if visitor returns false
                return;
            }
        }
    }
};
Graph.prototype.closestPointToPoint = function ( point ) {
    var edges = this.edges;
    var minDistance = Number.POSITIVE_INFINITY;
    var minPoint = null;
    var minEdge = null;
    for ( var i = 0, l = edges.length; i < l; i++ ) {
        var edge = edges[ i ];
        var candidate = edge.closestPointToPoint( point );
        var d = point.distanceTo( candidate );
        if ( d < minDistance ) {
            minDistance = d;
            minPoint = candidate;
            minEdge = edge;
        }
    }
    //closest point
    return {
        distance : minDistance,
        point : minPoint,
        edge : minEdge
    };
};
Graph.prototype.findConnectingEdge = function ( node1, node2 ) {
    var edges = this.edges;
    for ( var i = 0; i < edges.length; i++ ) {
        var edge = edges[ i ];
        if ( edge.contains( node1 ) && edge.contains( node2 ) ) {
            return edge;
        }
    }
    return null;
};
Graph.prototype.getAttachedEdges = function ( node ) {
    var result = [];
    this.traverseAttachedEdges( node, function ( otherNode, edge ) {
        result.push( edge );
    } );
    return result;
};
Graph.prototype.containsNode = function ( node ) {
    return this.nodes.indexOf( node ) > -1;
};
Graph.prototype.length = function () {
    var edges = this.edges;
    var result = 0;
    for ( var i = 0; i < edges.length; i++ ) {
        var edge = edges[ i ];
        result += edge.length;
    }
    return result;
};
/**
 *
 * @param {*} node
 */
Graph.prototype.addNode = function ( node ) {
    this.nodes.push( node );
};

/**
 *
 * @param {Edge} edge
 */
Graph.prototype.addEdge = function ( edge ) {
    //check if nodes need to be added too
    for ( var i = 0; i < edge.nodes.length; i++ ) {
        var node = edge.nodes[ i ];
        if ( !this.containsNode( node ) ) {
            this.addNode( node );
        }
    }
    this.edges.push( edge );
    this.onChange.dispatch( edge );
};
Graph.prototype.removeEdge = function ( edge ) {
    var edges = this.edges;
    var indexOf = edges.indexOf( edge );
    if ( indexOf >= 0 ) {
        edges.splice( indexOf, 1 );
        this.onChange.dispatch( edge );
    } else {
        console.error( "Edge was not found" );
    }
};
Graph.prototype.reset = function () {
    this.edges = [];
    this.nodes = [];
    this.onChange.dispatch();
};
Graph.prototype.clone = function () {
    var graph = new Graph();
    graph.nodes = this.nodes.slice();
    graph.edges = this.edges.slice();
    return graph;
};
module.exports = Graph;
