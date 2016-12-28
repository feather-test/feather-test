/**
 * Run automated validations
 */

var featherTest = require('../index.js');
var utils = require('../utils.js');

// override console.log so we can validate output
var logs = [];
var oldLog = console.log;
console.log = function (msg) {
    logs.push(msg);
};

function validateOutput (actual, expected) {
    var unexpectedResults = false;
    utils.each(actual, function (entry, i) {
        if (entry !== expected[i]) {
            oldLog('   ✘ Expected "' + entry + '" to read "' + expected[i] + '"');
            unexpectedResults = true;
            return false;
        }
    });
    if (!unexpectedResults) {
        oldLog('   ✔ output is good');
    }
}

featherTest.queue('./features');
featherTest.run(function () {
    oldLog('\nWhen Feather is Passing\n');
    logs.shift();
    validateOutput(logs, [
        'passed: 9',
        'failed: 0',
        'skipped: 1',
        '\nAll tests passed!'
    ]);


    global.wrongValue = 666;

    logs = [];
    featherTest.unqueue();
    featherTest.queue('./features');
    featherTest.run(function () {
        oldLog('\nWhen Feather is Failing\n');
        logs.shift();
        validateOutput(logs, [
            'passed: 0',
            'failed: 9',
            'skipped: 1',
            '\nFailed tests:',
            '',
            'matchers',
            '   Expected "true" to be "666" ',
            '   Expected "{"a":1,"b":{"c":2}}" to be "666" ',
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



        logs = [];
        featherTest.options.timeout = 100;
        featherTest.unqueue();
        featherTest.queue('./timeout');
        featherTest.run(function () {
            oldLog('\nWhen Feather Times Out\n');
            logs.shift();
            validateOutput(logs, [
                'timeout',
                '   is handled properly'
            ]);
        });
    });
});
