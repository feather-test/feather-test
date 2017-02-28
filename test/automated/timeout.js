var featherTest = require('../../index.js');
var chalk = require('chalk');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.options.timeout = 100;
    featherTest.unqueue();
    featherTest.queue('./timeout');
    featherTest.run(function () {
        LOG.out('\nWhen Feather Times Out\n');
        validate.all(LOG.history, [
            chalk.yellow('\nSpec timed out!\n'),
            'timeout',
            '   is handled properly',
            '      should call done() within 100ms'
        ]);
        callback();
    });
};
