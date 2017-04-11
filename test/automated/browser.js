var FeatherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];

    var passingTest = new FeatherTest({
        helpers: [
            '../helpers/helper1.js',
            '../helpers/helper2.js'
        ]
    });

    passingTest.queue('../features');
    passingTest.helpers('../helpers/globbed');

    passingTest.browser(function () {
        LOG.out('\nWhen Feather runs in Browser Mode\n');
        validate.all(LOG.history, [
            '*',
            '\nAll 10 tests passed!',
            '\n(1 tests skipped)'
        ]);
        callback();
    });
};
