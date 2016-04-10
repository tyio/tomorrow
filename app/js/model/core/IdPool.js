/**
 * Created by Alex on 01/04/2014.
 */


"use strict";
var IdPool = function () {
    this.reset();
};
IdPool.prototype.get = function () {
    var id;
    var available = this.available;
    var length = available.length;
    if (length > 0) {
        //first check available pool
        id = available.pop();
    } else {
        //if no id is available - create new one
        id = this.max++;
    }
    //add to used pool
    this.used[id] = true;
    return id;
};
/**
 * Attempt to request a specific ID from the pool.
 * @param id
 * @return {boolean} true if request succeeds, false otherwise
 */
IdPool.prototype.getSpecific = function (id) {
    if (this.isUsed(id)) {
        return false;
    } else {
        this.used[id] = true;
        if (id >= this.max) {
            this.max = id + 1;
        }
        return true;
    }
};
IdPool.prototype.isUsed = function (id) {
    return this.used[id] !== void 0;
};
IdPool.prototype.release = function (id) {
    var used = this.used;
    delete used[id];
    this.available.push(id);
};
IdPool.prototype.reset = function () {
    this.used = []; //stores IDs that are currently in use
    this.available = []; //stores IDs that have been freed, so they can be re-used
    this.max = 0; //highest used ID so far
};
module.exports = IdPool;
