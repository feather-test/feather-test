var FeatherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    global.wrongValue = 666;

    var failingTest = new FeatherTest({
        specs: '../features',
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

    failingTest.run(function () {
        LOG.out('\nWhen Feather is Failing\n');
        validate.all(LOG.history, [
            '',
            'Failed tests:',
            '',
            'matchers',
            '*',
            '*',
            '*',
            '*',
            '*',
            '*',
            '*',
            '*',
            '*',
            '',
            'negated',
            '   when mogwai gets wet',
            '      he becomes a gremlin',
            '*',
            '*',
            '',
            'sponge',
            '   when it gets wet',
            '      grows',
            '*',
            '',
            'sponge',
            '   when it gets wet',
            '      does not shrink',
            '*',
            '',
            'sponge',
            '   when it gets wet',
            '*',
            '',
            'sponge',
            '   when it dries out',
            '      shrinks',
            '*',
            '',
            'sponge',
            '   when it dries out',
            '*',
            '',
            'additional outer blocks',
            '*',
            '',
            'async',
            '   asserts expectations now and later',
            '*',
            '*',
            '',
            '9 tests failed!',
            '\n(1 tests skipped)'
        ]);

        global.wrongValue = null;
        callback();
    });
};
