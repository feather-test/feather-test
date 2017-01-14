var featherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./modules');
    featherTest.run(function () {
        LOG.out('\nWhen Feather Mutates Modules\n');
        LOG.history.shift();
        validate.all(LOG.history, [
            'passed: 3',
            'failed: 0',
            '\nAll tests passed!'
        ]);
        callback();
    });
};
