var clone = require('./clone.js');
var each = require('seebigs-each');
var matchers =  require('./matchers.js');
var reporter = require('./reporter.js');

var _origClearTimeout = clearTimeout;
var _origClearInterval = clearInterval;
var _origSetTimeout = setTimeout;
var _origSetInterval = setInterval;

function FeatherTestRunner (options) {
    if (!this instanceof FeatherTestRunner) {
        return new FeatherTestRunner();
    }

    var root = typeof global !== 'undefined' ? global : window;
    var tab = '   ';
    var shortCircuit;
    var afterRun;
    var allParsed;
    var expectContext = {
        depth: 0,
        labels: [],
    };


    /* RESET */

    var pendingAsync;
    var pendingSync;
    var pendingCallback;
    var results = {
        passed: [],
        failed: [],
        skipped: [],
    };
    var spies = [];

    function reset () {
        pendingAsync = 0;
        pendingSync = 0;
        pendingCallback = null;
        results.passed = [];
        results.failed = [];
        results.skipped = [];
        spies = [];
    }


    /* DESCRIBES & EXPECTS */

    function describe (label, assertions) {
        var expectationsAsserted = false;
        var async = assertions.length > 1;

        if (async) {
            pendingAsync++;
        } else {
            pendingSync++;
        }

        // keep track of how nested we are
        expectContext.depth++;

        // preserve labels from parent describes
        expectContext.labels.push(label);

        // reset expectations
        expectContext.expectationsRequired = assertions.length > 0;
        expectContext.passedExpectations = [];
        expectContext.failedExpectations = [];
        expectContext.containsExpectations = false;

        // reset internals
        clock._delayedActions = [];

        // optional setup
        if (typeof options.beforeEach === 'function') {
            options.beforeEach();
        }

        var clonedExpectContext = clone(expectContext);

        var expect = function (actual) {
            clonedExpectContext.expectationsAsserted = true;
            var lineMap = getLineMap(new Error());
            var finalMatchers = matchers.get(this, options, tab, actual, lineMap, recordResult);
            finalMatchers.not = matchers.get(this, options, tab, actual, lineMap, recordResult, true);
            return finalMatchers;
        };

        var assertionArgs = [ expect.bind(clonedExpectContext) ];
        if (async) {
            clonedExpectContext.async = true;
            var describeLine = new Error().stack.split('\n')[2];
            assertionArgs.push(describeDone.bind(clonedExpectContext));
            clonedExpectContext.timeout = _origSetTimeout(function () {
                var indent = getCurrentIndent(clonedExpectContext);
                recordResult(clonedExpectContext, false, false, indent + 'Timed out! It should call done() within ' + options.timeout + 'ms\n    ' + describeLine);
                describeDone.apply(clonedExpectContext);
            }, options.timeout);
        }

        function cleanupContext () {
            (spies[expectContext.depth] || []).forEach(function (spy) {
                spy.obj[spy.methodName] = spy.original;
            });
            expectContext.depth--;
            expectContext.labels.pop();
            clock._delayedActions = [];
        }

        try {
            assertions.apply(clonedExpectContext, assertionArgs);
        } catch (err) {
            clonedExpectContext.failedExpectations = []; // clear failed expectations to make room for the error
            recordResult(clonedExpectContext, false, false, '\n' + (err.stack || err));
            cleanupContext();
            describeDone.apply(clonedExpectContext);
            return;
        }

        cleanupContext();
        if (!async) {
            describeDone.apply(clonedExpectContext);
        }
    }

    function describeDone () {
        _origClearTimeout(this.timeout);

        if (this.async) {
            pendingAsync--;
        } else {
            pendingSync--;
        }

        var expectContext = this;

        function failOut() {
            results.failed.push(expectContext);
            if (options.stopAfterFistFailure) {
                shortCircuit(true);
            }
        }

        if (expectContext.containsExpectations) {
            if (expectContext.failedExpectations.length) {
                failOut();
            } else if (expectContext.passedExpectations.length) {
                results.passed.push(expectContext);
            }
            expectContext.containsExpectations = false;

        } else if (expectContext.expectationsRequired) {
            recordResult(expectContext, false, false, getCurrentIndent(expectContext) + 'No expectations were asserted!');
            failOut();
        }

        // teardown
        if (typeof options.afterEach === 'function') {
            options.afterEach();
        }

        afterRun();
    }

    function getCurrentIndent(expectContext) {
        var indent = '';
        expectContext.labels.forEach(function (label) {
            indent += tab;
        });
        return indent;
    }

    function getLineMap (err) {
        if (err.stack) {
            var line = '';
            var arr = err.stack.split('\n');

            // shift until we find "expect"
            while (line.indexOf('expect') === -1) {
                line = arr.shift();
            }

            // shift one more to get to the real line that threw
            line = arr.shift();

            // shift past "[native code]" lines (thanks Safari)
            while (line.indexOf('[native') === 0) {
                line = arr.shift();
            }

            return '@' + line.replace(/ *at |\@/, '');
        }

        return '';
    }

    function recordResult (currentTest, passed, negated, result) {
        if ((passed && !negated) || (!passed && negated)) {
            currentTest.passedExpectations.push(result);
        } else {
            currentTest.failedExpectations.push(result);
        }
        currentTest.containsExpectations = true;
    }

    function xdescribe (label) {
        results.skipped.push(label);
    }


    /* RUNNER */

    function hasPending () {
        return pendingSync > 0 || pendingAsync > 0;
    }

    shortCircuit = function (withReport) {
        if (withReport) {
            reporter.report(results, tab, options);
        }
        afterRun = function(){};
        shortCircuit = function(){};
        if (typeof pendingCallback === 'function') {
            pendingCallback();
        }
    };

    afterRun = function () {
        if (allParsed && !hasPending()) {
            reporter.report(results, tab, options);
            if (typeof pendingCallback === 'function') {
                pendingCallback();
            }
        }
    };


    /* SPIES */

    function Spy (replacement, original) {
        original = original || function(){};

        function spy () {
            var args = Array.prototype.slice.call(arguments);
            spy.calls.push(args);
            if (typeof replacement === 'function') {
                return replacement.apply(this, args);
            }
        }

        spy.calls = [];
        spy.original = original;

        return spy;
    }

    Spy.on = function (obj, methodName, replacement) {
        var original = obj[methodName];
        var spy = Spy(replacement, original);

        if (original) {
            spies[expectContext.depth] = spies[expectContext.depth] || [];
            spies[expectContext.depth].push({
                obj,
                methodName,
                original,
            });

            obj[methodName] = spy;

        } else {
            throw new Error('spy.on property `' + methodName + '` does not exist. Use `obj.' + methodName + ' = spy()` instead.');
        }

        return spy;
    };


    /* ANY */

    function Any (type) {
        this.Any = type.name;
        this.constructor = type;
    }

    Any.prototype.toString = function () {
        return 'fooooo';
    };

    function any (constructor) {
        return new Any(constructor);
    }


    /* CLOCK */

    var clock = {
        _clearTimeout: clearTimeout,
        _clearInterval: clearInterval,
        _setTimeout: setTimeout,
        _setInterval: setInterval,
        _guid: 0,
        _timer: 0,
        _delayedActions: [],
        _removeAction: function (id) {
            function find(id) {
                var index = null;
                each(clock._delayedActions, function (action, i) {
                    if (action.id === id) {
                        index = i;
                    }
                });
                return index;
            }

            clock._delayedActions.splice(find(id), 1);
        },

        install: function () {
            function addAction(fn, delay, args) {
                delay = delay || 0;
                if (typeof fn === 'function') {
                    var timestamp = clock._timer;
                    clock._guid++;
                    clock._delayedActions.push({
                        id: clock._guid,
                        absoluteTime: delay + clock._timer,
                        timestamp: timestamp,
                        delay: delay,
                        fn: fn,
                        args: args,
                    });
                    return clock._guid;
                }
            }

            global.setTimeout = function(fn, delay) {
                if (typeof fn === 'function') {
                    return addAction(fn, delay, Array.prototype.slice.call(arguments, 2));
                }
            };

            global.setInterval = function(fn, delay) {
                delay = delay || 0;
                if (typeof fn === 'function') {
                    var args = Array.prototype.slice.call(arguments, 0);
                    return addAction(function () {
                        fn.apply({}, Array.prototype.slice.call(args, 2));
                        global.setInterval.apply({}, args);
                    }, delay, args)
                }
            };

            global.clearInterval = clock._removeAction;
            global.clearTimeout = clock._removeAction;
        },

        tick: function (timeIncrement) {
            var eventualSystemTime = clock._timer + timeIncrement;
            function getNextAction() {
                // go through all delayed actions that have been added
                // its important re-filter and re-sort in case an action
                // mutated this list while it was executing.
                var actions = clock._delayedActions
                    .filter(function (action) {
                        return action.absoluteTime <= eventualSystemTime;
                    })
                    .sort(function(a1, a2) {
                        return a1.delay + a1.timestamp > a2.delay + a2.timestamp;
                    });
                return actions[0];
            }

            function doAction() {
                var action = getNextAction();
                if (action) {
                    clock._timer = action.absoluteTime;
                    action.fn.apply({}, action.args);

                    clock._removeAction(action.id);
                    doAction();
                }
            }

            doAction();
            clock._timer = eventualSystemTime;
        },

        uninstall: function () {
            clearTimeout = clock._clearTimeout;
            clearInterval = clock._clearInterval;
            setTimeout = clock._setTimeout;
            setInterval = clock._setInterval;
        },
    };


    /* PUBLIC */

    // Allow users to add new spec globals as plugins
    function addPlugin (name, plugin) {
        root[name] = plugin;
    }

    // Activate the test and listen for any describes to be executed
    function listen () {
        root.__dirname = '/';
        root.any = any;
        root.clock = clock;
        root.describe = describe;
        root.it = describe; // make it easier to switch to feather from jasmine
        root.spy = Spy;
        root.xdescribe = xdescribe;
        root.xit = xdescribe;
        reset();
    }

    // Signify that all specs have been parsed
    //   wait for any async tests to finish, then report
    function report (callback) {
        pendingCallback = callback;
        allParsed = true;
        afterRun();
    }

    return {
        addPlugin: addPlugin,
        listen: listen,
        report: report,
        reporter: reporter,
    };
}


module.exports = FeatherTestRunner;
