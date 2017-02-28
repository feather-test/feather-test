var featherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./features');
    featherTest.run(function () {
        LOG.out('\nWhen Feather is Passing\n');
        validate.all(LOG.history, [
            '\nAll 9 tests passed!',
            '\n(1 tests skipped)'
        ]);
        callback();
    });
};
