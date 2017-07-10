var FeatherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    global.featherHelpers = [];

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

    passingTest.run(function () {
        LOG.out('\nWhen Feather is Passing\n');
        validate.all(LOG.history, [
            '\nAll 17 tests passed!',
            '\n(1 tests skipped)'
        ]);
        callback();
    });
};
