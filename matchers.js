/**
 * Returns available matchers
 */

var utils = require('./utils.js');

var toString = Object.prototype.toString;

function fnReplacer (key, val) {
    return (typeof val === 'function') ? '[Function]' : val;
}

function _typeof (thing) {
    return Object.prototype.toString.call(thing).split(' ').pop().slice(0, -1);
}

function toStr (thing, printType) {
    var str;

    if (typeof thing === 'object') {
        str = JSON.stringify(thing, fnReplacer);
    } else {
        str = thing;
    }

    return '"' + str + '" ' + (printType ? '{' + _typeof(thing) + '}' : '');
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

function resultMessage (matcher, actual, expected, tab, neg, msg, printType) {
    var _actual = _typeof(actual);
    var _expected = _typeof(expected);
    var ptype = printType && _actual !== _expected;
    return '%%-----\n%%expected\n%%' + tab + toStr(actual, ptype) + '\n%%' + neg + matcher + '\n%%' + tab + toStr(expected, ptype) + (msg || '');
}

function get (currentTest, tab, actual, recordResult, negated) {
    var neg = negated ? 'not ' : '';
    return {
        toBe: function (expected, msg) {
            var result = resultMessage('to be', actual, expected, tab, neg, msg, true);
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        },
        toBeGreaterThan: function (expected, msg) {
            var result = resultMessage('to be greater than', actual, expected, tab, neg, msg);
            recordResult(currentTest, actual > expected, negated, result);
        },
        toBeLessThan: function (expected, msg) {
            var result = resultMessage('to be less than', actual, expected, tab, neg, msg);
            recordResult(currentTest, actual < expected, negated, result);
        },
        toContain: function (expected, msg) {
            var result = resultMessage('to contain', actual, expected, tab, neg, msg);
            recordResult(currentTest, actual.indexOf(expected) !== -1, negated, result);
        },
        toEqual: function (expected, msg) {
            var result = resultMessage('to equal', actual, expected, tab, neg, msg, true);
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        }
    }
}

module.exports = {
    get: get
};
