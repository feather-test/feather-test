/**
 * Returns available matchers
 */

var anythingToString = require('anything-to-string');
var each = require('./each.js');

var toString = Object.prototype.toString;

function _typeof (thing) {
    return toString.call(thing).split(' ').pop().slice(0, -1);
}

function toStr (thing, printType) {
    var str = anythingToString.stringify(thing);
    return '"' + str + '" ' + (printType ? '{' + _typeof(thing) + '}' : '');
}

function deepMatch (expected, actual) {
    if (actual === expected) {
        return true;

    } else if (typeof expected === 'object' && typeof actual === 'object') {
        var match = true;
        var actualIsEmpty = true;
        var expectedIsEmpty = true;

        each(expected, function (val, prop) {
            expectedIsEmpty = false;
            if (!deepMatch(val, actual[prop])) {
                return match = false;
            }
        });

        each(actual, function (val, prop) {
            actualIsEmpty = false;
            if (!deepMatch(val, expected[prop])) {
                return match = false;
            }
        });

        if (actualIsEmpty && expectedIsEmpty) {
            return toString.call(actual) === toString.call(expected);
        }

        return match;

    }

    return false;
}

function resultMessage (matcher, actual, expected, tab, neg, msg, lineMap, printType) {
    var _actual = _typeof(actual);
    var _expected = _typeof(expected);
    var ptype = printType && _actual !== _expected;
    return '' +
        '%%-----' + (lineMap ? '\n%%' + lineMap : '') +
        (msg ? '\n%%' + msg : '') +
        '\n%%expected\n%%' + tab + toStr(actual, ptype) +
        '\n%%' + neg + matcher +
        '\n%%' + tab + toStr(expected, ptype);
}

function get (currentTest, options, tab, actual, lineMap, recordResult, negated) {
    var neg = negated ? 'not ' : '';
    var builtInMatchers = {
        toBe: function (expected, msg) {
            var result = resultMessage('to be', actual, expected, tab, neg, msg, lineMap, true);
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        },
        toBeGreaterThan: function (expected, msg) {
            var result = resultMessage('to be greater than', actual, expected, tab, neg, msg, lineMap);
            recordResult(currentTest, actual > expected, negated, result);
        },
        toBeLessThan: function (expected, msg) {
            var result = resultMessage('to be less than', actual, expected, tab, neg, msg, lineMap);
            recordResult(currentTest, actual < expected, negated, result);
        },
        toContain: function (expected, msg) {
            var result = resultMessage('to contain', actual, expected, tab, neg, msg, lineMap);
            recordResult(currentTest, actual.indexOf(expected) !== -1, negated, result);
        },
        toEqual: function (expected, msg) {
            var result = resultMessage('to equal', actual, expected, tab, neg, msg, lineMap, true);
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        }
    };

    var customMatchers = {};
    each(options.customMatchers, function (customMatcher) {
        customMatchers[customMatcher.name] = function (expected, msg) {
            var utils = {
                deepMatch: deepMatch
            };
            var result = resultMessage(customMatcher.message, actual, expected, tab, neg, msg, lineMap, customMatcher.printType);
            recordResult(currentTest, customMatcher.matcher(expected, actual, utils), negated, result);
        };
    });

    return Object.assign({}, builtInMatchers, customMatchers);
}

module.exports = {
    get: get
};
