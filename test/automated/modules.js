var featherTest = require('../../index.js');
var chalk = require('chalk');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./modules');
    featherTest.run(function () {
        LOG.out('\nWhen Feather Mutates Modules\n');
        validate.all(LOG.history, [
            chalk.green('\nAll 3 tests passed!')
        ]);
        callback();
    });
};
