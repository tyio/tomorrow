/**
 * Created by Alex on 01/09/2014.
 */


"use strict";
var Graph = require( "../graph/Graph" );
var Transition = require( "./Transition" );

var StateMachine = function () {
    this.graph = new Graph();
    this.state = null;
    this.isLocked = false;
};

/**
 *
 * @param {*} source
 * @param {*} target
 * @param {Transition~action} action
 * @param {Transition~condition} [condition]
 * @returns {Transition}
 */
StateMachine.prototype.createTransition = function ( source, target, action, condition ) {
    var transition = new Transition(source,target, action,condition);
    this.addTransition(transition);
    return transition;
};

/**
 *
 * @param {Transition} t
 */
StateMachine.prototype.addTransition = function ( t ) {
    this.graph.addEdge( t );
};

/**
 *
 * @param {*} s
 */
StateMachine.prototype.addState = function ( s ) {
    this.graph.addNode( s );
};

/**
 *
 * @param {Array.<*>} states
 */
StateMachine.prototype.addAllStates = function ( states ) {
    for(var i=0, l=states.leangth; i<l; i++){
        this.addState(states[i]);
    }
};

StateMachine.prototype.setState = function ( s ) {
    this.state = s;
};
StateMachine.prototype.canTransitionTo = function ( nextState ) {
    var source = this.state;
    var result = false;
    this.traverseValidTransitions( function ( node, edge ) {
        if ( node === nextState && edge.condition( source, node ) ) {
            result = true;
            //stop traversal
            return false;
        }
    } );
    return result;
};

/**
 *
 * @param {Graph~visitor} visitor
 */
StateMachine.prototype.traverseValidTransitions = function ( visitor ) {
    var source = this.state;
    this.graph.traverseSuccessors( source, function ( node, edge ) {
        if ( edge.condition( source, node ) ) {
            return visitor( node, edge );
        }
    } );
};


/**
 *
 * @param {Transition} transition
 * @returns {Promise}
 */
StateMachine.prototype.transitionOn = function ( transition ) {
    var sm = this;
    return new Promise(function ( resolve, reject) {
        if ( transition === null ) {
            //no transition was found
            reject( "no transition found" );
        }
        //check lock on state machine
        if ( sm.isLocked ) {
            reject( "state machine is locked, can not execute transition" );
        }

        //lock state machine
        sm.isLocked = true;

        var promise = transition.action( state, nextState );

        function handleTransitionSuccess() {
            sm.isLocked = false;
            sm.setState( nextState );
            resolve();
        }

        function handleTransitionFailed( e ) {
            sm.isLocked = false;
            reject( e );
        }

        promise.then( handleTransitionSuccess, handleTransitionFailed );
    });
};

/**
 *
 * @param {*} nextState Adjacent state
 * @returns {Promise}
 */
StateMachine.prototype.transitionTo = function ( nextState ) {
    var sm = this;
    var state = sm.state;

    return new Promise( function ( resolve, reject ) {
        if ( state === nextState ) {
            //already there
            resolve();
        }
        var transition = null;
        sm.traverseValidTransitions( function ( target, t ) {
            transition = t;
            //stop traversal
            return false;
        } );
        sm.transitionOn(transition).then(resolve,reject);
    } );
};

/**
 *
 * @param {*} targetState
 * @returns {Promise}
 */
StateMachine.prototype.navigateTo = function ( targetState ) {
    //find path
    var graph = this.graph;
    var path = graph.findPath( this.state, targetState );

    if ( path == null ) {
        return Promise.reject( "no path found to target state" );
    }

    var result = Promise.resolve();

    for ( var i = 1, l = path.length; i < l; i++ ) {
        var next = path[ i ];
        result = result.then( this.transitionTo( next ) );
    }

    return result;
};

module.exports = StateMachine;
