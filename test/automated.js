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


var passing = require('./automated/passing.js');
var failing = require('./automated/failing.js');
var modules = require('./automated/modules.js');
var errors = require('./automated/errors.js');
var timeout = require('./automated/timeout.js');
var browser = require('./automated/browser.js');

passing(LOG, validate, function () {
    failing(LOG, validate, function () {
        modules(LOG, validate, function () {
            errors(LOG, validate, function () {
                timeout(LOG, validate, function () {
                    console.log = LOG.out;
                    browser();
                });
            });
        });
    });
});
