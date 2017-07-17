const FeatherTest = require('../../index.js');

var testSuite = new FeatherTest({
    exitProcessWhenFailing: false,
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

testSuite.queue('../specs/features');
testSuite.helpers('../helpers/globbed');

module.exports = function (callback) {
    testSuite.run(callback);
};
