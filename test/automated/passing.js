var featherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./features');
    featherTest.run(function () {
        LOG.out('\nWhen Feather is Passing\n');
        LOG.history.shift();
        validate.all(LOG.history, [
            'passed: 9',
            'failed: 0',
            'skipped: 1',
            '\nAll tests passed!'
        ]);
        callback();
    });
};
