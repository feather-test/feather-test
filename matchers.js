/**
 * Returns available matchers
 */

var utils = require('./utils.js');

function toStr (thing) {
    if (typeof thing === 'object') {
        return JSON.stringify(thing);
    }
    return thing.toString();
}

function deepMatch (expected, actual) {
    if (typeof expected === 'object') {
        var match = true;
        utils.each(expected, function (val, prop) {
            if (!deepMatch(val, actual[prop])) {
                return match = false;
            }
        });
        return match;

    } else {
        return actual === expected;
    }
}

function get (actual, recordResult, negated) {
    var neg = negated ? ' not' : '';
    return {
        toBe: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to be "' + toStr(expected) + '" ' + (msg || '');
            recordResult(deepMatch(expected, actual), negated, result);
        },
        toBeGreaterThan: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to be greater than "' + toStr(expected) + '" ' + (msg || '');
            recordResult(actual > expected, negated, result);
        },
        toBeLessThan: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to be less than "' + toStr(expected) + '" ' + (msg || '');
            recordResult(actual < expected, negated, result);
        },
        toContain: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to contain "' + toStr(expected) + '" ' + (msg || '');
            recordResult(actual.indexOf(expected) !== -1, negated, result);
        },
        toEqual: function (expected, msg) {
            var result = 'Expected "' + toStr(actual) + '"' + neg + ' to equal "' + toStr(expected) + '" ' + (msg || '');
            recordResult(deepMatch(expected, actual), negated, result);
        }
    }
}

module.exports = {
    get: get
};
