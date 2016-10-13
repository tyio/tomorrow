/**
 * Created by Alex on 13/10/2016.
 */

var SAMPLES_PER_PAGE = 1000;

/**
 *
 * @param {Number} value
 * @returns {boolean}
 */
function isPowerOfTwo(value) {

    return ( value & ( value - 1 ) ) === 0 && value !== 0;

}

function ReducedDataTables() {
    var channelTypes = channels.map(function (c) {
        return c.dataType;
    });

    /**
     *
     * @type {RowFirstTable}
     */
    this.min = new RowFirstTable(channelTypes);
    /**
     *
     * @type {RowFirstTable}
     */
    this.max = new RowFirstTable(channelTypes);
}

function ReducedDataPage(startMasterValue, endMasterValue, channels) {
    this.start = startMasterValue;
    this.end = endMasterValue;

    /**
     *
     * @type {ReducedDataTables}
     */
    this.data = new ReducedDataTables(channels);
}

ReducedDataPage.prototype.containsValueAfter = function (value) {
    return this.start > value && this.end <= value;
};

ReducedDataPage.prototype.containsValue = function (value) {
    return this.start >= value && this.end <= value;
};
/**
 *
 * @param {Number} factor
 * @param {ReducedData|DataFrame} source
 * @constructor
 */
function ReducedData(factor, source) {
    if (factor % 1 !== 0) {
        throw new Error("Reduction factor must be a whole number, actual is " + factor);
    }
    if (!isPowerOfTwo(factor)) {
        throw new Error("Reduction factor must be a power of 2, actual is " + factor);
    }

    if (source instanceof ReducedData && source.factor > factor) {
        throw new Error("Source is ReducedData, reduction factor of source(" + source.factor + ") must be lower than current one(" + factor + ").");
    }

    this.factor = factor;

    this.source = source;

    this.pages = [];
}

ReducedData.prototype.createPage = function (startMasterValue) {
    var endMasterValue = -1;
    var source = this.source;
    if (source instanceof ReducedData) {
        var sourceFactor = source.factor;

        var relativeFactor = sourceFactor / this.factor;

        source.traverse(startMasterValue, endMasterValue, function (values) {

        });
    } else {
        //assume DataFrame

    }

    var result = new ReducedDataPage(startMasterValue, endMasterValue);
    return result;
};

ReducedData.prototype.findIndexForPage = function (newPage) {
    var pages = this.pages;

    var pageCount = pages.length;
    if (pageCount === 0) {
        return 0;
    }

    var prevPage = pages[0];

    if (pageCount == 1 && prevPage.start < newPage.end) {
        return 0;
    }

    for (var i = 1; i < pageCount; i++, prevPage = page) {
        var page = pages[i];
        if (prevPage.start < newPage.end && page.end > newPage.start) {
            return i;
        }
    }

};

ReducedData.prototype.storePage = function (page) {
    //find position where to store it
    var index = this.findIndexForPage(page);
    this.pages.splice(index, 0, page);
    return index;
};

ReducedData.prototype.getPageIndexContainingValue = function (value) {
    //TODO binary search
    var pages = this.pages;
    for (var i = 0, l = pages.length; i < l; i++) {
        var page = pages[i];
        if (page.containsValue(value)) {
            return i;
        }
    }
    //not found
    return -1;
};

ReducedData.prototype.traversePages = function (startMasterValue, endMasterValue, visitor) {
    var self = this;
    var lastPage = null;

    var pageIndex = this.getPageIndexContainingValue(startMasterValue);

    var pages = this.pages;


    var page = undefined;
    if (pageIndex !== -1) {
        page = pages[pageIndex];
    } else {
        //TODO consider "build or fill" mechanic
        page = this.createPage(startMasterValue);
        this.storePage(page);
    }


    function getNextPage(v) {
        pageIndex++;
        var page = pages[pageIndex];
        if (page === undefined || !page.containsValueAfter(v)) {
            //we need to build new page
            page = self.createPage(startMasterValue);
            pageIndex = self.storePage(page);

        }
        return page;
    }

    for (var v = startMasterValue; v < endMasterValue; v = lastPage.end, page = getNextPage(v)) {
        visitor(page);
    }
};

ReducedData.prototype.traverse = function (startMasterValue, endMasterValue, visitor) {
    /**
     *
     * @param {ReducedDataPage} page
     */
    function visitPage(page) {
        var data = page.data;
        var minData = data.min;
        var maxData = data.max;

        var startIndex = 0;
        if(page.start < startMasterValue){
            //page starts before master start value, we need to shift start index

        }
    }

    this.traversePages(startMasterValue, endMasterValue, visitPage);
};

/**
 *
 * @param {DataFrame} source
 * @constructor
 */
function DataAccessor(source) {
    this.source = source;
}

DataAccessor.prototype.traverseReduced = function () {

};

module.exports = DataAccessor;