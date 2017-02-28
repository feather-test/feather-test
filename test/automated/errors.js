var chalk = require('chalk');
var featherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./errors');
    featherTest.run(function () {
        LOG.out('\nWhen Feather Catches Errors\n');
        var issues = [];
        validate.one(issues, LOG.history[5], '\n1 tests failed!');
        validate.one(issues, (LOG.history[4] || '').split('\n')[1], 'ReferenceError: oops is not defined');
        validate.one(issues, LOG.history[3], '   errors in assertions');
        if (issues.length) {
            LOG.out(issues[0]);
        } else {
            LOG.out(chalk.green('   ✔ output is good'));
        }
        callback();
    });
};
