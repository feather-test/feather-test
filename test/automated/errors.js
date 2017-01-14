var chalk = require('chalk');
var featherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./errors');
    featherTest.run(function () {
        LOG.out('\nWhen Feather Catches Errors\n');
        LOG.history.shift();
        var issues = [];
        validate.one(issues, (LOG.history[5] || '').split('\n')[0], '   ReferenceError: oops is not defined');
        validate.one(issues, LOG.history[0], 'passed: 0');
        validate.one(issues, LOG.history[1], 'failed: 1');
        if (issues.length) {
            LOG.out(issues[0]);
        } else {
            LOG.out(chalk.green('   ✔ output is good'));
        }
        callback();
    });
};
