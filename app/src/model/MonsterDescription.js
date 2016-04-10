/**
 * Created by Alex on 18/02/14.
 */


"use strict";
var MonsterDescription = Backbone.Model.extend({
    defaults: {
        attackPower: 1,
        attackSpeed: 1,
        attackRange: 1,
        movementSpeed: 0
    }
});
module.exports = MonsterDescription;
