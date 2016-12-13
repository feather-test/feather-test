
var fs = require('fs');

var hasProp = Object.prototype.hasOwnProperty;

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
    each: each,
    listFiles: listFiles
};
