/**
 * Created by Alex on 18/08/2016.
 */

"use strict";

var Channel = require('./model/tomorrow/channel/Channel');
var DataType = require('./model/tomorrow/data/DataType');
var DataFrame = require('./model/tomorrow/data/DataFrame');
var GraphBuilder = require('./model/tomorrow/GraphBuilder');

var Tomorrow = {
    Channel:Channel,
    DataType: DataType,
    DataFrame: DataFrame,
    GraphBuilder: GraphBuilder
};

module.exports = Tomorrow;