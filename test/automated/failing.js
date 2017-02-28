var featherTest = require('../../index.js');
var chalk = require('chalk');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];
    featherTest.unqueue();
    featherTest.queue('./features');
    global.wrongValue = 666;
    featherTest.run(function () {
        LOG.out('\nWhen Feather is Failing\n');
        validate.all(LOG.history, [
            '\nFailed tests:',
            '',
            'matchers',
            '   -----\n   expected\n      "true" {Boolean}\n   to be\n      "666" {Number}',
            '   -----\n   expected\n      "{"a":1,"b":{"c":2}}" {Object}\n   to be\n      "666" {Number}',
            '   -----\n   expected\n      "{"fn":"[Function]"}" {Object}\n   to be\n      "666" {Number}',
            '   -----\n   expected\n      "[123,{"a":1}]" {Array}\n   to equal\n      "666" {Number}',
            '   -----\n   expected\n      "{}" {Object}\n   to equal\n      "666" {Number}',
            '   -----\n   expected\n      "99" \n   to be greater than\n      "666" ',
            '   -----\n   expected\n      "999" \n   to be less than\n      "666" ',
            '   -----\n   expected\n      "abc123def" \n   to contain\n      "666" ',
            '',
            'negated',
            '   when mogwai gets wet',
            '      he becomes a gremlin',
            '         -----\n         expected\n            "smooth" \n         not to be\n            "smooth" ',
            '         -----\n         expected\n            "angry" {String}\n         to be\n            "666" {Number}',
            '',
            'sponge',
            '   when it gets wet',
            '      grows',
            '         -----\n         expected\n            "larger" {String}\n         to be\n            "666" {Number}',
            '',
            'sponge',
            '   when it gets wet',
            '      does not shrink',
            '         -----\n         expected\n            "same" {String}\n         to be\n            "666" {Number}',
            '',
            'sponge',
            '   when it gets wet',
            '      -----\n      expected\n         "unnested" {String}\n      to be\n         "666" {Number}',
            '',
            'sponge',
            '   when it dries out',
            '      shrinks',
            '         -----\n         expected\n            "smaller" {String}\n         to be\n            "666" {Number}',
            '',
            'sponge',
            '   when it dries out',
            '      -----\n      expected\n         "unnested" {String}\n      to be\n         "666" {Number}',
            '',
            'additional outer blocks',
            '   -----\n   expected\n      "extra" {String}\n   to be\n      "666" {Number}extra messages too!',
            '',
            'async',
            '   asserts expectations now and later',
            '      -----\n      expected\n         "666" {Number}\n      to be\n         "outer" {String}',
            '      -----\n      expected\n         "666" \n      to be\n         "3" ',
            chalk.red('\n9 tests failed!'),
            '\n(1 tests skipped)'
        ]);
        callback();
    });
    // global.wrongValue = null;
};
