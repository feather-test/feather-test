/**
 * Run automated validations
 */

var chalk = require('chalk');
var utils = require('seebigs-utils');

// override console.log so we can validate output
var CONSOLE = {
    history: [],
    log: console.log,
    error: console.error,
};
console.log = function (msg) {
    CONSOLE.history.push(msg);
    CONSOLE.log(msg);
};
console.error = function (msg) {
    CONSOLE.history.push(msg);
    CONSOLE.error(msg);
};

var validate = {

    all: function (actual, expected) {
        var unexpectedResults = false;
        utils.each(actual, function (entry, i) {
            if (entry !== expected[i] && expected[i] !== '*') {
                CONSOLE.log(chalk.red('   ✘ Expected "' + entry + '" to read "' + expected[i] + '"'));
                unexpectedResults = true;
                return false;
            }
        });
        if (!unexpectedResults) {
            CONSOLE.log(chalk.green('\n   ✔ output is good\n'));
        } else {
            process.exit(1);
        }
    },

    one: function (issues, actual, expected) {
        if (actual !== expected) {
            issues.push(chalk.red('\n   ✘ Expected "' + actual + '" to read "' + expected + '"\n'));
        }
    }

};

const passing = require('./configurations/passing.js');
const failing = passing;
const modules = require('./configurations/modules.js');
const errors = require('./configurations/errors.js');
const timeout = require('./configurations/timeout.js');

passing(function () {
    modules(function () {
        global.wrongValue = 666;
        failing(function () {
            delete global.wrongValue;
            errors(function () {
                timeout(function () {
                    console.log = CONSOLE.log;
                    console.log();
                    validate.all(CONSOLE.history, [
'\nAll 19 tests passed!',
'\n(1 tests skipped)',
'\nAll 3 tests passed!',
'\nFailed tests:',
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
'\n(1 tests skipped)',
'\nFailed tests:',
'',
'handles',
'   errors in assertions',
'*',
'',
'1 tests failed!',
'\nFailed tests:',
'',
'timeout',
'   is handled properly',
'*',
'',
'1 tests failed!',
                    ]);
                });
            });
        });
    });
});
