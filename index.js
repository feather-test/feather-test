const discoverSourcePath = require('discover-source-path');
const FeatherRunner = require('./bundle_ready/runner.js');
const fs = require('fs');
const path = require('path');
const utils = require('seebigs-utils');


function runInNode (relativeTo, options, done) {

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
        helpers: [],
        exitProcessWhenFailing: true,
        stopAfterFistFailure: false,
        timeout: 5000
    };
    var extendedConfig = Object.assign({}, defaultConfig, config, utils.args());

    this.config = extendedConfig;

    this.helpers = function (helpers) {
        this.config.helpers = this.config.helpers.concat(helpers);
    }

    this.queue = function (specs) {
        this.config.specs = this.config.specs.concat(specs);
    };

    this.run = function (callback) {
        var options = this.config;
        var relativeTo = discoverSourcePath(3);

        runInNode(relativeTo, options, function () {
            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    this.runner = FeatherRunner;
}

module.exports = FeatherTest;
