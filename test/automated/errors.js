var chalk = require('chalk');
var FeatherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];

    var errorsTest = new FeatherTest({
        specs: '../errors'
    });

    errorsTest.run(function () {
        LOG.out('\nWhen Feather Catches Errors\n');
        var issues = [];
        validate.one(issues, LOG.history[7], '1 tests failed!');
        validate.one(issues, (LOG.history[5] || '').split('\n')[1], 'ReferenceError: oops is not defined');
        validate.one(issues, LOG.history[4], '   errors in assertions');
        if (issues.length) {
            LOG.out(issues[0]);
        } else {
            LOG.out(chalk.green('   ✔ output is good'));
        }
        callback();
    });
};
