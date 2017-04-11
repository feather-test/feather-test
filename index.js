const bundlPack = require('bundl-pack');
const fs = require('fs');
const nodeAsBrowser = require('node-as-browser');
const opn = require('./lib/opn.js');
const path = require('path');
const utils = require('seebigs-utils');

var featherRunner = path.resolve(__dirname, './bundled/feather-test-runner.js');

// use a hack to find the dir from which FeatherTest was called
function discoverRelativePath (err) {
    err = err.stack.split('\n');
    err.shift();
    err.shift();
    var pathPieces = err.shift().split('/');
    pathPieces.shift();
    pathPieces.pop();
    return '/' + pathPieces.join('/') + '/';
}

function createBundleThenRun (relativeTo, options, done) {
    var concat = '';

    function requireFile (specFile) {
        var pathToFile = path.resolve(relativeTo, specFile);
        var stats = fs.statSync(pathToFile);
        if (stats.isFile()) {
            concat += 'require.cache.clear();\n';
            concat += 'require("' + pathToFile + '");\n';
        } else {
            var files = utils.listFiles(pathToFile);
            files.forEach(function (file) {
                concat += 'require.cache.clear();\n';
                concat += 'require("' + path.resolve(relativeTo, file) + '");\n';
            });
        }
    }

    concat += '// setup feather-test-runner\n';
    concat += 'var FeatherTestRunner = require("' + featherRunner + '");\n';
    concat += 'var featherTest = new FeatherTestRunner(' + JSON.stringify(options, null, 4) + ');\n';
    concat += 'featherTest.listen();\n'

    concat += '\n// load your helpers\n';
    utils.each(options.helpers, requireFile);

    concat += '\n// run your specs\n';
    utils.each(options.specs, requireFile);

    concat += '\n// report results\n';
    concat += 'featherTest.report();';

    var testBundle = bundlPack({}).one.call({ LINES: concat.split('\n').length + 3 }, concat, {
        name: 'test.js',
        contents: concat,
        src: [],
        sourcemaps: []
    });

    utils.writeFile(options.destDir + '/test.js', testBundle.contents, function () {
        utils.writeFile(options.destDir + '/test.html', utils.readFile(__dirname + '/lib/test.html'), function (written) {
            done({
                html: options.destDir + '/test.html',
                js: options.destDir + '/test.js'
            });
        });
    });
}

function runInNodeOnly (relativeTo, options, done) {

    function clearRequireCache () {
        for (var x in require.cache) {
            delete require.cache[x];
        }
    }

    function requireFile (specFile) {
        var pathToFile = path.resolve(relativeTo, specFile);
        var stats = fs.statSync(pathToFile);
        if (stats.isFile()) {
            clearRequireCache();
            require(pathToFile);

        } else {
            var files = utils.listFiles(pathToFile);
            files.forEach(function (file) {
                clearRequireCache();
                require(file);
            });
        }
    }

    // setup feather-test-runner
    var FeatherRunner = require(featherRunner);
    var runner = new FeatherRunner(options);
    runner.listen();

    // load your helpers
    utils.each(options.helpers, requireFile);

    // run your specs
    utils.each(options.specs, requireFile);

    // report results
    runner.report(done);
}


function FeatherTest (config) {
    config = config || {};

    if (typeof config !== 'object') {
        config = {
            specs: config
        }
    }

    config.specs = config.specs || [];
    if (typeof config.specs === 'string') {
        config.specs = [config.specs];
    }

    var defaultConfig = {
        destDir: './feather',
        stopAfterFistFailure: false,
        timeout: 5000
    };
    var extendedConfig = Object.assign({}, defaultConfig, config, utils.args());
    extendedConfig.destDir = path.resolve(extendedConfig.destDir);

    this.config = extendedConfig;

    this.helpers = function (helpers) {
        this.config.helpers = this.config.helpers.concat(helpers);
    }

    this.queue = function (specs) {
        this.config.specs = this.config.specs.concat(specs);
    };

    this.run = function (callback) {
        var options = this.config;
        var relativeTo = discoverRelativePath(new Error());

        if (options.browser || options['browser-open']) {
            this._relativeTo = relativeTo;
            this.browser.call(this);

        } else {
            runInNodeOnly(relativeTo, options, function () {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }
    };

    this.browser = function () {
        var options = this.config;
        var relativeTo = this._relativeTo || discoverRelativePath(new Error());

        createBundleThenRun(relativeTo, options, function (testBundle) {
            nodeAsBrowser.init(global);
            require(testBundle.js);

            console.log('Run your test by opening: ' + testBundle.html);
            if (options['browser-open']) {
                opn(testBundle.html);
            }
        });
    };
}

module.exports = FeatherTest;
