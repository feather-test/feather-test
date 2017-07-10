const utils = require('seebigs-utils');

const tab = '    ';

function replacer (key, value) {
    return (typeof value === 'function' ) ? value.toString() : value;
}

function valToString (val) {
    let valType = typeof val;
    switch (valType) {
        case 'string':
            return '"' + val + '"';

        case 'object':
            if (Array.isArray(val)) {
                let strArr = '';
                utils.each(val, function (item) {
                    strArr += '\n' + tab + tab + valToString(item) + ',';
                });
                return '[' + strArr + '\n' + tab + ']';

            } else {
                let strObj = '';
                utils.each(val, function (objVal, objKey) {
                    strObj += '\n' + tab + tab + objKey + ': ' + valToString(objVal) + ',';
                });
                return '{' + strObj + '\n' + tab + '}';
            }

        default:
            return val;
    }
}

function fromObject (obj) {
    let str = '{';

    utils.each(obj, function (val, key) {
        if (key.charAt(0) !== '_') {
            str += '\n    ' + key + ': ' + valToString(val) + ',';
        }
    });

    str += '\n};'

    return str;
}

module.exports = {
    fromObject,
};
