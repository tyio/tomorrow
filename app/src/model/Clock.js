/**
 * Created by Alex on 11/02/14.
 */


"use strict";
function timeInSeconds() {
    return Date.now()/1000;
}

function updateElapsedTime(clock) {
    var now = timeInSeconds();
    var delta = (now - clock.__lastMeasurement) * clock.multiplier;
    clock.__lastMeasurement = now;
    clock.elapsedTime += delta;
}

var Clock = function () {
    this.__lastMeasurement = 0;
    this.elapsedTime = 0;
    this.multiplier = 1;//how fast clock ticks in relation to real time
    this.timeAtDelta = 0;
    this.__isRunning = false;
};
Clock.prototype.start = function () {
    this.__lastMeasurement = timeInSeconds();
    this.timeAtDelta = this.getElapsedTime();
    this.__isRunning = true;
};
Clock.prototype.pause = function () {
    this.__isRunning = false;
    //update time
    updateElapsedTime(this);
};
Clock.prototype.getDelta = function () {
    var elapsedTime = this.getElapsedTime();
    var delta = elapsedTime - this.timeAtDelta;
    this.timeAtDelta = elapsedTime;
    return delta;
};
Clock.prototype.getElapsedTime = function () {
    if (this.__isRunning) {
        updateElapsedTime(this);
    }
    return this.elapsedTime;
};
Clock.prototype.reset = function () {
    this.elapsedTime = 0;
    this.timeAtDelta = 0;
};
module.exports = Clock;
