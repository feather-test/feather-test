var featherTest = require('../../index.js');
var chalk = require('chalk');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.helpers([
        './helpers/helper1.js',
        './helpers/helper2.js'
    ]);
    global.featherHelpers = [];
    featherTest.helpers('./helpers/globbed');
    featherTest.queue('./features');
    featherTest.run(function () {
        LOG.out('\nWhen Feather is Passing\n');
        validate.all(LOG.history, [
            chalk.green('\nAll 10 tests passed!'),
            '\n(1 tests skipped)'
        ]);
        featherTest.helpers(null);
        callback();
    });
};
