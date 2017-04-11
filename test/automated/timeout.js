var FeatherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];

    var timeoutTest = new FeatherTest({
        specs: '../timeout',
        timeout: 100
    });

    timeoutTest.run(function () {
        LOG.out('\nWhen Feather Times Out\n');
        validate.all(LOG.history, [
            '\nSpec timed out!\n',
            'timeout',
            '   is handled properly',
            '      should call done() within 100ms'
        ]);
        callback();
    });
};
