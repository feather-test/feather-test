var clone = require('./clone.js');
var each = require('seebigs-each');

var arrSlice = Array.prototype.slice;

function extend () {
    var ret = arguments[0];

    each(arrSlice.call(arguments, 1), function (ext) {
        each(ext, function (val, key) {
            if (typeof val !== 'undefined') {
                ret[key] = clone(val);
            }
        });
    }, this);

    return ret;
}

module.exports = extend;
