var Big = require('big.js');

var MetricPrefix = {
    map: {
        '1': {
            name: 'kilo',
            symbol: 'k'
        },
        '2': {
            name: 'mega',
            symbol: 'M'
        },
        '3': {
            name: 'giga',
            symbol: 'G'
        },
        '4': {
            name: 'tera',
            symbol: 'T'
        },
        '5': {
            name: 'peta',
            symbol: 'P'
        },
        '6': {
            name: 'exa',
            symbol: 'E'
        },
        '7': {
            name: 'zetta',
            symbol: 'Z'
        },
        '8': {
            name: 'yotta',
            symbol: 'Y'
        },
        '-1': {
            name: 'milli',
            symbol: 'm'
        },
        '-2': {
            name: 'micro',
            symbol: 'μ'
        },
        '-3': {
            name: 'nano',
            symbol: 'n'
        },
        '-4': {
            name: 'pico',
            symbol: 'p'
        },
        '-5': {
            name: 'femto',
            symbol: 'f'
        },
        '-6': {
            name: 'atto',
            symbol: 'a'
        },
        '-7': {
            name: 'zepto',
            symbol: 'z'
        },
        '-8': {
            name: 'yocto',
            symbol: 'y'
        }
    },

    text: function (power) {
        var prefix = this.map[power];

        if (prefix) {
            return prefix.name;
        } else {
            return '';
        }
    },

    symbol: function (power) {
        var prefix = this.map[power];

        if (prefix) {
            return prefix.symbol;
        } else {
            return '';
        }
    },

    reduce: function (number) {
        if (number === 0) {
            return number;
        }

        number = new Big(number);
        var exponent = number.e;
        var sign = number.s;
        var symbol = '';

        if (exponent >= 3 || exponent < 0) {
            exponent = Math.floor(exponent / 3);
            symbol = this.symbol(exponent);
            number = number.abs().div(Math.pow(1000, exponent));
            number.s = sign;
        }

        return number.toFixed() + symbol;
    }
};

module.exports = MetricPrefix;