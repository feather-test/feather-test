/**
 * Run automated validations
 */

var chalk = require('chalk');
var utils = require('seebigs-utils');

// override console.log so we can validate output
var LOG = {
    history: [],
    out: console.log
};
console.log = function (msg) {
    LOG.history.push(msg);
    LOG.out(msg);
};
console.log.real = LOG.out;

var validate = {

    all: function (actual, expected) {
        var unexpectedResults = false;
        utils.each(actual, function (entry, i) {
            if (entry !== expected[i] && expected[i] !== '*') {
                LOG.out(chalk.red('   ✘ Expected "' + entry + '" to read "' + expected[i] + '"'));
                unexpectedResults = true;
                return false;
            }
        });
        if (!unexpectedResults) {
            LOG.out(chalk.green('   ✔ output is good'));
        }
    },

    one: function (issues, actual, expected) {
        if (actual !== expected) {
            issues.push(chalk.red('   ✘ Expected "' + actual + '" to read "' + expected + '"'));
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
                    console.log = LOG.out;
                    console.log();
                    validate.all(LOG.history, [
'\nAll 18 tests passed!',
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
'9/18 tests failed!',
'\n(1 tests skipped)',
'\nFailed tests:',
'',
'handles',
'   errors in assertions',
'*',
'',
'1/1 tests failed!',
'\nFailed tests:',
'',
'timeout',
'   is handled properly',
'      Timed out! It should call done() within 100ms',
'',
'1/1 tests failed!',
'\n1 slow tests:',
'',
'timeout',
'   is handled properly'
                    ]);
                });
            });
        });
    });
});
