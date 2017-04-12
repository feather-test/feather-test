
function stringify (obj) {
    return JSON.stringify(obj, function (key, value) {
        return (typeof value === 'function' ) ? value.toString() : value;
    }).replace(/\\n/g, ' ').replace(/"/g, '\\"');
}

function parse (key, value) {
    return (typeof value === 'string' && value.indexOf('function ') === 0) ? eval('('+value+')') : value;
}

module.exports = {
    stringify: stringify,
    parse: parse
};
