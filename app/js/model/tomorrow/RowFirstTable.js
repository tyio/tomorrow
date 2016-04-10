/**
 * Created by Alex on 10/04/2016.
 */

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

    this.data = new ArrayBuffer( rowCount );

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