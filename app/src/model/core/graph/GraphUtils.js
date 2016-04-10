/**
 * Created by Alex on 05/02/14.
 */


"use strict";
var Utils = {};

function getLineIntersection( p0, p1, p2, p3 ) {
    var p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y;
    p0_x = p0.x;
    p0_y = p0.y;
    p1_x = p1.x;
    p1_y = p1.y;
    p2_x = p2.x;
    p2_y = p2.y;
    p3_x = p3.x;
    p3_y = p3.y;
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;
    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
    if ( s >= 0 && s <= 1 && t >= 0 && t <= 1 ) { // Collision detected
        var intX = p0_x + (t * s1_x);
        var intY = p0_y + (t * s1_y);
        return [ intX, intY ];
    }
    return null; // No collision
}

function pointBetweenEdges( edge1, edge2, node, thickness ) {
    var other1 = edge1.other( node );
    var other2 = edge2.other( node );
    var delta1 = other1.clone().sub( node );
    var delta2 = other2.clone().sub( node );
    var sum = delta2.normalize().clone().add( delta1.normalize() );
    var angle = edge2.angle() - edge1.angle();
    if ( angle < 0 ) {
        angle += Math.PI * 2;
    }
//                console.log(angle * (57.295));
    if ( angle === 0 ) {
        //parallel edges
        sum.set( delta1.y, delta1.x );
        sum.multiplyScalar( thickness / 2 );
        console.log( ">" );
    } else {
        var scalar = (thickness / 2) * (1 + sum.length() / 4);
        sum.normalize().multiplyScalar( scalar );
        if ( angle > Math.PI ) {
            console.log( "<" );
            sum.negate();
        }
    }
    return sum;
}

function angleDifference( edge1, edge2 ) {
    return edge1.angle() - edge2.angle();
}

function trace2( graph, thickness ) {
    //clone graph
    var g = graph.clone();
    var closedNodes = [];
    var closedEdges = [];
    //edge needs to be covered twice to be closed
    var prevEdge, prevNode,
        currentEdge, currentNode;
    while (g.edges.length > 0) {
        //pick next edge
        var node = prevEdge.other( prevNode );
        var neighbours = g.getAttachedEdges( node );
        neighbours.sort( angleDifference );
        var index = neighbours.indexOf( prevEdge );
        index = (index + 1) % neighbours.length;
        var edge = neighbours[ index ];
    }
}

function makeCap( node, edge, thickness, type ) {
    var result = [];
    //get direction
    var other = edge.other( node );
    var first = node.clone();
    var second = other.clone();
    var delta = second.clone().sub( first );
    var inverseDelta = delta.clone();
    inverseDelta.x = delta.y;
    inverseDelta.y = -delta.x;
    inverseDelta.normalize();
    //projecting cap
    if ( type == "projecting" ) {
        var half_thickness = thickness / 2;
        var sid = inverseDelta.clone().multiplyScalar( half_thickness );
        //projecting offset
        var offset = delta.clone().normalize().multiplyScalar( half_thickness );
        var anchor = node.clone().sub( offset );
        result.push( sid.clone().add( anchor ) );
        result.push( sid.negate().add( anchor ) );
    }
    return result;
}

function makeJoint2( node, edges, thickness ) {
    var result = [];
    //sort edges by angle
    edges.sort( angleDifference );

    for ( var i = 0; i < edges.length; i++ ) {
        var j = (i + 1) % edges.length;
        var edge1 = edges[ i ];
        var edge2 = edges[ j ];
        var sum = pointBetweenEdges( edge1, edge2, node, thickness );
        result.push( {
            point : sum,
            edges : [ edge1, edge2 ]
        } )
    }
    result.forEach( function ( element ) {
        element.point.add( node );
    } );
    return result;
}

function graph2paths( graph, thickness ) {
    var points = [];
    var nodes = graph.nodes;
    //generating outline points
    for ( var i = 0; i < nodes.length; i++ ) {
        var node = nodes[ i ];
        var attachedEdges = graph.getAttachedEdges( node );
        var length = attachedEdges.length;
        if ( length == 0 ) {
            //this node is not attached to any edge
            console.warn( "unconnected node, not representable" );
        } else if ( length == 1 ) {
            //this is an end point
            var attachedEdge = attachedEdges[ 0 ];
            var cap = makeCap( node, attachedEdge, thickness, "projecting" );
            cap.forEach( function ( point ) {
                points.push( {node : node, edges : [ attachedEdge ], position : point} );
            } );
        } else if ( length > 1 ) {
            //this is a joint
            var joint = makeJoint2( node, attachedEdges, thickness, null );
            joint.forEach( function ( data ) {
                points.push( {node : node, edges : data.edges, position : data.point} )
            } );
        }
    }
    var path;

    function getCommonEdge( point1, point2 ) {
        var edges1 = point1.edges;
        var edges2 = point2.edges;
        var l1 = edges1.length;
        var l2 = edges2.length;
        for ( var i = 0; i < l1; i++ ) {
            var edge1 = edges1[ i ];
            for ( var j = 0; j < l2; j++ ) {
                var edge2 = edges2[ j ];
                if ( edge1 == edge2 ) {
                    return edge1;
                }
            }
        }
        return null;
    }

    function lineIntersectsGraph( from, to, graph ) {
        var edges = graph.edges;
        for ( var i = 0, l = edges.length; i < l; i++ ) {
            var edge = edges[ i ];
            if ( getLineIntersection( from, to, edge.first, edge.second ) ) {
                return true;
            }
        }
        return false;
    }

    function getNextPoint2( from ) {
        //filter points based on common edge
        var edges0 = from.edges;
        var l0 = edges0.length;
        var candidates = [];
        points.forEach( function ( point, index ) {
            var edges1 = point.edges;
            var l1 = edges1.length;
            for ( var i = 0; i < l0; i++ ) {
                var e0 = edges0[ i ];
                for ( var j = 0; j < l1; j++ ) {
                    var e1 = edges1[ j ];
                    if ( e0 === e1 ) {
                        //now filter out those that cross the graph
                        if ( !lineIntersectsGraph( from.position, point.position, graph ) ) {
                            candidates.push( index );
                        }
                    }
                }
            }
        } );
        if ( candidates.length > 0 ) {
            var index = candidates[ 0 ];
            var point = points[ index ];
            points.splice( index, 1 );
            return point;
        } else {
            console.warn( "No next point from ", from );
        }

    }

    function getNextPoint( from ) {
        for ( var i = 0; i < points.length; i++ ) {
            var p = points[ i ];
            var commonEdge = getCommonEdge( p, from );
            if ( commonEdge != null ) {
                //make sure line would not intersect the edge
//                        var intersects = getLineIntersection(p.position, from.position, commonEdge.first, commonEdge.second);
                var intersects = lineIntersectsGraph( p.position, from.position, graph );
                if ( intersects ) {
                    continue;
                }
                points.splice( i, 1 );
                return p;
            }
        }
        console.warn( "No next point from", from );
        return null;
    }

    function trace() {
        //pick a point
        var currentPoint = points.pop();
        var nextPoint;
        path.moveTo( currentPoint.position.x, currentPoint.position.y );
//            console.log("path.moveTo("+currentPoint.position.x+","+currentPoint.position.y+");");
        var firstPoint = currentPoint;
        for ( nextPoint = getNextPoint2( currentPoint ); nextPoint != null; nextPoint = getNextPoint2( currentPoint ) ) {
            path.lineTo( nextPoint.position.x, nextPoint.position.y );
//                console.log("path.lineTo("+nextPoint.position.x+","+nextPoint.position.y+");");
            currentPoint = nextPoint;
        }
        path.lineTo( firstPoint.position.x, firstPoint.position.y );
//            console.log("path.lineTo("+firstPoint.position.x+","+firstPoint.position.y+");");
    }

    var paths = [];
    while (points.length > 0) {
        path = new THREE.Path();
        trace();
        paths.push( path );
    }
    return paths;
}

function graph2rects( graph, thickness ) {
    var edges = graph.edges;
    var paths = [];
    for ( var i = 0; i < edges.length; i++ ) {
        var path = new THREE.Path();
        var edge = edges[ i ];
        //outline edge
        var cap1 = makeCap( edge.first, edge, thickness, "projecting" );
        var cap2 = makeCap( edge.second, edge, thickness, "projecting" );
        var points = cap1.concat( cap2 );
        var point = points[ 0 ];
        path.moveTo( point.x, point.y );
        for ( var j = 1, l = points.length; j < l + 1; j++ ) {
            point = points[ j % l ];
            path.lineTo( point.x, point.y );
        }
        paths.push( path );
    }
    return paths;
}

Utils.makeJoint2 = makeJoint2;
Utils.paths2shapes = function ( paths ) {
    var shapes = [];
    paths.forEach( function ( path ) {
        var r = path.toShapes();
        Array.prototype.push.apply( shapes, r );
    } );
    return shapes;
};
Utils.graph2shapes = function ( graph, thickness ) {
    var paths = Utils.graph2paths( graph, thickness );
    return Utils.paths2shapes( paths );
};
Utils.graph2paths = graph2paths;
module.exports = Utils;