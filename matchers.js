/**
 * Returns available matchers
 */

var utils = require('./utils.js');

var toString = Object.prototype.toString;

function toStr (thing) {
    if (typeof thing === 'object') {
        return JSON.stringify(thing);
    }
    return thing;
}

function deepMatch (expected, actual) {
    if (typeof expected === 'object' && typeof actual === 'object') {
        var match = true;
        var actualIsEmpty = true;
        var expectedIsEmpty = true;

        utils.each(expected, function (val, prop) {
            expectedIsEmpty = false;
            if (!deepMatch(val, actual[prop])) {
                return match = false;
            }
        });

        utils.each(actual, function (val, prop) {
            actualIsEmpty = false;
            if (!deepMatch(val, expected[prop])) {
                return match = false;
            }
        });

        if (actualIsEmpty && expectedIsEmpty) {
            return toString.call(actual) === toString.call(expected);
        }

        return match;

    } else {
        return actual === expected;
    }
}

function get (currentTest, actual, recordResult, negated) {
    var neg = negated ? ' not' : '';
    return {
        toBe: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to be "' + toStr(expected) + '" ' + (msg || '');
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        },
        toBeGreaterThan: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to be greater than "' + toStr(expected) + '" ' + (msg || '');
            recordResult(currentTest, actual > expected, negated, result);
        },
        toBeLessThan: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to be less than "' + toStr(expected) + '" ' + (msg || '');
            recordResult(currentTest, actual < expected, negated, result);
        },
        toContain: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to contain "' + toStr(expected) + '" ' + (msg || '');
            recordResult(currentTest, actual.indexOf(expected) !== -1, negated, result);
        },
        toEqual: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to equal "' + toStr(expected) + '" ' + (msg || '');
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        }
    }
}

module.exports = {
    get: get
};
