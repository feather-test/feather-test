var hasProp = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

function clone (thing) {
    var ret;
    var type = toString.call(thing).split(' ').pop();

    // return simple types that have length
    if (!thing || type === 'String]' || type === 'Function]' || thing === thing.window) {
        return thing;
    }

    if (type === 'Object]') {
        if (thing.nodeType) {
            throw new Error('DOM Nodes should not be cloned using this clone method');
        }

        ret = Object.create(thing);
        for (var key in thing) {
            if (hasProp.call(thing, key)) {
                if (thing !== thing[key]) { // recursion prevention
                    ret[key] = clone(thing[key]);
                }
            }
        }

    } else if (thing.length) {
        ret = [];
        for (var i = 0, len = thing.length; i < len; i++) {
            if (thing !== thing[i]) { // recursion prevention
                ret[i] = clone(thing[i]);
            }
        }

    } else {
        ret = thing;
    }

    return ret;
}

module.exports = clone;
