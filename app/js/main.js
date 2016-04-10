var Channel = require( './model/tomorrow/Channel');
var DataFrame = require( './model/tomorrow/DataFrame');

var channel = new Channel();
channel.name = 'a';
channel.unit = 's';
channel.dataType = 'int';

var dataFrame = new DataFrame();
dataFrame.channels.push(channel);
