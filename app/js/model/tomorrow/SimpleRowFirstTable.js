/**
 * Created by Alex on 10/04/2016.
 */
var SimpleRowFirstTable = function () {
    this.types = [];

    this.data= [];
};

SimpleRowFirstTable.prototype.addRow = function ( values ) {
    this.data.push(values);
};

SimpleRowFirstTable.prototype.getRow = function ( index, result ) {
    var record = this.data[index];
    for(var i=0, l=record.length; i<l; i++){
        result[i] = record[i];
    }
};

module.exports = SimpleRowFirstTable;