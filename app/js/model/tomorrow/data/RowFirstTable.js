/**
 * Created by Alex on 10/04/2016.
 */

"use strict";
var Signal = require('../../core/Signal');

var DataViewReaders = {
    "uint8": "getUint8",
    "uint16": "getUint16",
    "uint32": "getUint32",
    "uint64": "getUint64",

    "int8": "getInt8",
    "int16": "getInt16",
    "int32": "getInt32",
    "int64": "getInt64",

    "float32": "getFloat32",
    "float64": "getFloat64"
};
var DataViewWriters = {
    "uint8": "setUint8",
    "uint16": "setUint16",
    "uint32": "setUint32",
    "uint64": "setUint64",

    "int8": "setInt8",
    "int16": "setInt16",
    "int32": "setInt32",
    "int64": "setInt64",

    "float32": "setFloat32",
    "float64": "setFloat64"
};
var ByteSizeMap = {
    "uint8": 1,
    "uint16": 2,
    "uint32": 4,
    "uint64": 8,

    "int8": 1,
    "int16": 2,
    "int32": 4,
    "int64": 8,

    "float32": 4,
    "float64": 8
};
function genRowReader(types) {
    var offset = 0;
    var lines = [];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        lines.push("result[" + i + "] = dataView." + DataViewReaders[type] + "(" + offset + " + byteOffset);");
        offset += ByteSizeMap[type];
    }

    var result = new Function(['dataView, byteOffset, result'], lines.join("\n"));
    return result;
}

function genRowWriter(types) {
    var offset = 0;
    var lines = [];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        lines.push("dataView." + DataViewWriters[type] + "(" + offset + " + byteOffset, record[" + i + "]);");
        offset += ByteSizeMap[type];
    }

    var result = new Function(['dataView, byteOffset, record'], lines.join("\n"));
    return result;
}

var RowFirstTable = function RowFirstTable(types) {
    /**
     *
     * @type {Array.<DataType>}
     */
    this.types = types;

    this.data = new ArrayBuffer(0);

    this.bytesPerRecord = types.reduce(function (count, t) {
        return count + ByteSizeMap[t];
    }, 0);

    this.length = 0;
    this.rowsAvailable = 0;

    this.on = {
        added: new Signal()
    };
    this.initialize();
};

RowFirstTable.prototype.initialize = function () {
    this.generateIO();
};

RowFirstTable.prototype.generateIO = function () {
    this.readRowMethod = genRowReader(this.types);
    this.writeRowMethod = genRowWriter(this.types);
};

RowFirstTable.prototype.setActualSize = function (rowCount) {
    var oldData = this.data;

    var byteSize = rowCount * this.bytesPerRecord;
    try {
        this.data = new ArrayBuffer(byteSize);
    } catch (e) {
        throw new Error("failed to create a new array buffer of size: " + byteSize);
    }

    //check the size of new array
    if (this.data.byteLength !== byteSize) {
        throw new Error("Generated array was truncated unexpectedly from " + byteSize + " to " + this.data.byteLength);
    }

    var newArray = new Uint8Array(this.data);
    var oldArray = new Uint8Array(oldData);

    try {
        newArray.set(oldArray, 0);
    } catch (e) {
        if (e instanceof RangeError) {
            throw new Error("Failed to copy contents of original due to to size violation. OldSize: " + oldData.byteLength + ", NewSize: " + this.data.byteLength);
        } else {
            throw e;
        }
    }

    this.rowsAvailable = rowCount;

    this.dataView = new DataView(this.data, 0);
};

RowFirstTable.prototype.resize = function (rowCount) {
    if (this.rowsAvailable < rowCount) {
        //grow
        var growFactor = 1.5;
        var newSize = Math.ceil(rowCount * growFactor);
        this.setActualSize(newSize);
    } else if (this.rowsAvailable * 0.5 > rowCount) {
        //shrink
        this.setActualSize(rowCount);
    }
};

/**
 *
 * @param {Array.<Number>} values
 */
RowFirstTable.prototype.addRow = function (values) {

    var newRowCount = this.length + 1;

    this.resize(newRowCount);

    var rowIndex = this.length;

    this.length = newRowCount;


    this.writeRowMethod(this.dataView, this.bytesPerRecord * rowIndex, values);

    this.on.added.dispatch(rowIndex, values);
};

/**
 *
 * @returns {Number}
 */
RowFirstTable.prototype.getNumColumns = function () {
    return this.types.length;
};

/**
 *
 * @param {int} count
 * @param {function} callback
 */
RowFirstTable.prototype.addRows = function (count, callback) {
    var newRowCount = this.length + count;

    this.resize(newRowCount);

    var i = this.length;
    this.length = newRowCount;

    var row = new Array(this.getNumColumns());

    var bytesPerRecord = this.bytesPerRecord;
    var dataView = this.dataView;
    var writeRowMethod = this.writeRowMethod;

    var onAdded = this.on.added;

    function addOneSignaling(index) {
        addOneSilent(index);
        onAdded.dispatch(index, row);
    }

    function addOneSilent(i) {
        callback(i, row);
        writeRowMethod(dataView, bytesPerRecord * i, row);
    }

    //depending on whether signal is being listened, pick signaling or silent generator
    var addOne = onAdded.isConnected() ? addOneSignaling : addOneSilent;

    for (; i < newRowCount; i++) {
        addOne(i);
    }

};

/**
 *
 * @param {int} index
 * @param {Array} result where row values are to be stored
 */
RowFirstTable.prototype.getRow = function (index, result) {
    this.readRowMethod(this.dataView, this.bytesPerRecord * index, result);
};
/**
 * @param {int} rowIndex
 * @param {int} valueIndex
 * @returns {number}
 */
RowFirstTable.prototype.getRowValue = function () {
    var row = [];

    /**
     *
     * @param {int} rowIndex
     * @param {int} valueIndex
     * @returns {number}
     */
    function getRowValue(rowIndex, valueIndex) {
        this.getRow(rowIndex, row);
        return row[valueIndex];
    }

    return getRowValue;
}();

module.exports = RowFirstTable;