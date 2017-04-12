var FeatherTest = require('../index.js');

var customMatchers = [
    {
        name: 'myCustomMatcher',
        message: 'to be custom',
        matcher: function (expected, actual) {
            return actual * 3 === expected;
        }
    }
];

global.featherHelpers = [];

var passingTest = new FeatherTest({
    helpers: [
        './helpers/helper1.js',
        './helpers/helper2.js'
    ],
    customMatchers: customMatchers
});
passingTest.queue('./features');
passingTest.helpers('./helpers/globbed');

passingTest.browser(function () {

});
