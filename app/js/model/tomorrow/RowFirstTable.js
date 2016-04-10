/**
 * Created by Alex on 10/04/2016.
 */
var DataViewReaders = {
    "uint8":"getUint8",
    "uint16":"getUint16",
    "uint32":"getUint32",
    "uint64":"getUint64",

    "int8":"getInt8",
    "int16":"getInt16",
    "int32":"getInt32",
    "int64":"getInt64",
    
    "float32":"getFloat32",
    "float64":"getFloat64"
};
var DataViewWriters = {
    "uint8":"setUint8",
    "uint16":"setUint16",
    "uint32":"setUint32",
    "uint64":"setUint64",

    "int8":"setInt8",
    "int16":"setInt16",
    "int32":"setInt32",
    "int64":"setInt64",

    "float32":"setFloat32",
    "float64":"setFloat64"
};
function genRowReader( types, dataViewVar ) {
    var offset = 0;
    var lines = [];
    for(var i=0; i< types.length; i++){
        lines.push(dataViewVar+"."+DataViewReaders[types[i]]+"("+offset+", values["+i+"])");
    }
}

var RowFirstTable = function RowFirstTable() {
    /**
     *
     * @type {Array.<DataType>}
     */
    this.types = [];

    this.data = new ArrayBuffer( 0 );

    this.bytesPerRecord = 0;

    this.rowsUsed = 0;
    this.rowsAvailable = 0;
};

RowFirstTable.prototype.setActualSize = function ( rowCount ) {
    var oldData = this.data;

    this.data = new ArrayBuffer( rowCount*this.bytesPerRecord );

    var newArray = new Uint8Array( this.data );
    var oldArray = new Uint8Array( oldData );

    newArray.set( oldArray, 0 );

    this.rowsAvailable = rowCount;
};

RowFirstTable.prototype.resize = function ( rowCount ) {
    if ( this.rowsAvailable < rowCount ) {
        //grow
        var growFactor = 1.2;
        var newSize = rowCount * growFactor;
        this.setActualSize( newSize );
    } else if ( this.rowsAvailable * 0.7 > rowCount ) {
        //shrink
        this.setActualSize( rowCount );
    }
};

/**
 * 
 * @param {Array.<Number>} values
 */
RowFirstTable.prototype.addRow = function ( values ) {
    var types = this.types;
    var numChannels = types.length;

    var newRowCount = this.rowsUsed+1;

    this.resize(newRowCount);

    var rowIndex = this.rowsUsed;

    this.rowsUsed = newRowCount;

    var dataView = new DataView(this.data, this.bytesPerRecord*rowIndex);

    var byteOffset = 0;
    for ( var i = 0; i < numChannels; i++ ) {
        var type = types[ i ];
        var value = values[i];

        var setMethodName = "set"+type;
        dataView[setMethodName]();
    }

};

/**
 * 
 * @param {int} index
 * @param {Array} result where row values are to be stored
 */
RowFirstTable.prototype.getRow = function ( index, result ) {
    
};

module.exports = RowFirstTable;