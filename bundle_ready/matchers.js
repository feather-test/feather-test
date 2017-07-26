/**
 * Returns available matchers
 */

var anythingToString = require('anything-to-string');
var each = require('./each.js');
var extend = require('./extend.js');

var toString = Object.prototype.toString;

function _typeof (thing) {
    return toString.call(thing).split(' ').pop().slice(0, -1);
}

function toStr (thing, printType) {
    if (thing && thing.isAny){ return 'Any ' + thing.type.name; }
    var str = anythingToString.stringify(thing);
    return '"' + str + '" ' + (printType ? '{' + _typeof(thing) + '}' : '');
}

function deepMatch (expected, actual) {
    if (expected && expected.Any) {
        return _typeof(actual) === _typeof(expected.constructor())
    }
    if (actual && actual.Any) {
        return _typeof(expected) === _typeof(actual.constructor())
    }

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

function resultMessage (actual, matcher, expected, tab, neg, msg, lineMap, printType) {
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
            var result = resultMessage(actual, 'to be', expected, tab, neg, msg, lineMap, true);
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        },
        toBeGreaterThan: function (expected, msg) {
            var result = resultMessage(actual, 'to be greater than', expected, tab, neg, msg, lineMap);
            recordResult(currentTest, actual > expected, negated, result);
        },
        toBeLessThan: function (expected, msg) {
            var result = resultMessage(actual, 'to be less than', expected, tab, neg, msg, lineMap);
            recordResult(currentTest, actual < expected, negated, result);
        },
        toContain: function (expected, msg) {
            var result = resultMessage(actual, 'to contain', expected, tab, neg, msg, lineMap);

            function contains(actual, expected) {
                if ((Object.prototype.toString.apply(actual) === '[object Set]')) {
                    return actual.has(expected);
                }

                if ((Object.prototype.toString.apply(actual) === '[object Array]') ||
                    (!!actual && !actual.indexOf)) {
                    for (var i = 0; i < actual.length; i++) {
                        if (actual[i] === expected) {
                            return true;
                        }
                    }
                    return false;
                }

                return !!actual && actual.indexOf(expected) >= 0;
            }

            recordResult(currentTest, contains(actual, expected), negated, result);
        },
        toEqual: function (expected, msg) {
            var result = resultMessage(actual, 'to equal', expected, tab, neg, msg, lineMap, true);
            recordResult(currentTest, deepMatch(expected, actual), negated, result);
        },
        toHaveBeenCalled: function () {
            if (!actual || actual.name !== 'spy') { throw new Error('toHaveBeenCalled requires a spy'); }
            var result = resultMessage(actual.original.name || 'anonymous', 'to have been called', 'at least once', tab, neg, null, lineMap);
            recordResult(currentTest, actual.calls.length > 0, negated, result);
        },
        toHaveBeenCalledWith: function () {
            if (!actual || actual.name !== 'spy') { throw new Error('toHaveBeenCalledWith requires a spy'); }
            var expectedArgs = Array.prototype.slice.call(arguments);
            var matchingCallFound = false;
            each(actual.calls, function (call) {
                var argsMatch = true;
                each(expectedArgs, function (arg, index) {
                    if (!deepMatch(arg, call[index])) {
                        argsMatch = false;
                    }
                });
                if (argsMatch) {
                    matchingCallFound = true;
                }
            });
            var actualMessage = (actual.original.name || 'anonymous') + ' ' + anythingToString.stringify(actual.calls);
            var result = resultMessage(actualMessage, 'to have been called with', expectedArgs, tab, neg, null, lineMap);
            recordResult(currentTest, matchingCallFound, negated, result);
        },
    };

    var customMatchers = {};
    each(options.customMatchers, function (customMatcher) {
        customMatchers[customMatcher.name] = function (expected, msg) {
            var utils = {
                deepMatch: deepMatch
            };
            var result = resultMessage(actual, customMatcher.message, expected, tab, neg, msg, lineMap, customMatcher.printType);
            recordResult(currentTest, customMatcher.matcher(expected, actual, utils), negated, result);
        };
    });

    return extend({}, builtInMatchers, customMatchers);
}

module.exports = {
    get: get
};
