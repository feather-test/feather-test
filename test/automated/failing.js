var featherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./features');
    global.wrongValue = 666;
    featherTest.run(function () {
        LOG.out('\nWhen Feather is Failing\n');
        LOG.history.shift();
        validate.all(LOG.history, [
            'passed: 0',
            'failed: 9',
            'skipped: 1',
            '\nFailed tests:',
            '',
            'matchers',
            '   Expected "true" to be "666" ',
            '   Expected "{"a":1,"b":{"c":2}}" to be "666" ',
            '   Expected "{"fn":"[Function]"}" to be "666" ',
            '   Expected "[123,{"a":1}]" to equal "666" ',
            '   Expected "{}" to equal "666" ',
            '   Expected "99" to be greater than "666" ',
            '   Expected "999" to be less than "666" ',
            '   Expected "abc123def" to contain "666" ',
            '',
            'negated',
            '   when mogwai gets wet',
            '      he becomes a gremlin',
            '         Expected "smooth" not to be "smooth" ',
            '         Expected "angry" to be "666" ',
            '',
            'sponge',
            '   when it gets wet',
            '      grows',
            '         Expected "larger" to be "666" ',
            '',
            'sponge',
            '   when it gets wet',
            '      does not shrink',
            '         Expected "same" to be "666" ',
            '',
            'sponge',
            '   when it gets wet',
            '      Expected "unnested" to be "666" ',
            '',
            'sponge',
            '   when it dries out',
            '      shrinks',
            '         Expected "smaller" to be "666" ',
            '',
            'sponge',
            '   when it dries out',
            '      Expected "unnested" to be "666" ',
            '',
            'additional outer blocks',
            '   Expected "extra" to be "666" extra messages too!',
            '',
            'async',
            '   asserts expectations now and later',
            '      Expected "666" to be "outer" ',
            '      Expected "666" to be "3" '
        ]);
        callback();
    });
    // global.wrongValue = null;
};
