
var fs = require('fs');

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

function each (collection, iteratee, thisArg) {
    if (collection) {
        if (typeof collection.length !== 'undefined') {
            for (var i = 0, len = collection.length; i < len; i++) {
                if (iteratee.call(thisArg, collection[i], i, collection) === false) {
                    return;
                }
            }

        } else {
            for (var prop in collection) {
                if (hasProp.call(collection, prop)) {
                    if (iteratee.call(thisArg, collection[prop], prop, collection) === false) {
                        return;
                    }
                }
            }
        }
    }
}

function listFiles (dir, ext, _list) {
    ext = ext || [];
    _list = _list || [];

    var dirs = [];
    var files = [];

    each(fs.readdirSync(dir), function (item) {
        var pathname = dir + '/' + item;
        if (fs.statSync(pathname).isDirectory()) {
            dirs.push(pathname);
        } else {
            files.push(pathname);
        }
    });

    each(dirs, function (d) {
        listFiles(d, ext, _list);
    });

    each(files, function (f) {
        if (!ext.length || ext.indexOf(f.split('.').pop()) !== -1) {
            _list.push(f);
        }
    });

    return _list;
}

module.exports = {
    clone: clone,
    each: each,
    listFiles: listFiles
};
