var chalk = require('chalk');
var featherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.options.timeout = 100;
    featherTest.unqueue();
    featherTest.queue('./timeout');
    featherTest.run(function () {
        LOG.out('\nWhen Feather Times Out\n');
        LOG.history.shift();
        var issues = [];
        validate.one(issues, (LOG.history[3] || '').split('\n')[0], 'ReferenceError: oops is not defined');
        validate.one(issues, LOG.history[0], 'timeout');
        validate.one(issues, LOG.history[1], '   is handled properly');
        validate.one(issues, LOG.history[2], '      should call done() within 100ms');
        if (issues.length) {
            LOG.out(issues[0]);
        } else {
            LOG.out(chalk.green('   ✔ output is good'));
        }
        callback();
    });
};
