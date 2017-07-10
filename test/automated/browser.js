var FeatherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];

    var passingTest = new FeatherTest({
        helpers: [
            '../helpers/helper1.js',
            '../helpers/helper2.js'
        ],
        customMatchers: [
            {
                name: 'myCustomMatcher',
                message: 'to be custom',
                matcher: function (expected, actual) {
                    return actual * 3 === expected;
                }
            }
        ]
    });

    passingTest.queue('../features');
    passingTest.helpers('../helpers/globbed');

    passingTest.browser(function () {
        LOG.out('\nWhen Feather runs in Browser Mode\n');
        validate.all(LOG.history, [
            '*',
            '\nAll 15 tests passed!',
            '\n(1 tests skipped)'
        ]);
        callback();
    });
};
