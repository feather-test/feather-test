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
        expectContext.passedExpectations = [];
        expectContext.failedExpectations = [];
        expectContext.containsExpectations = false;

        // optional setup
        if (typeof options.beforeEach === 'function') {
            options.beforeEach();
        }


        var expect = function (actual) {
            var lineMap = getLineMap(new Error());
            var finalMatchers = matchers.get(this, options, tab, actual, lineMap, recordResult);
            finalMatchers.not = matchers.get(this, options, tab, actual, lineMap, recordResult, true);
            return finalMatchers;
        }

        var clonedExpectContext = clone(expectContext);
        var assertionArgs = [ expect.bind(clonedExpectContext) ];
        if (async) {
            clonedExpectContext.async = true;
            var describeLine = new Error().stack.split('\n')[2];
            assertionArgs.push(describeDone.bind(clonedExpectContext));
            clonedExpectContext.timeout = _origSetTimeout(function () {
                var indent = '';
                clonedExpectContext.labels.forEach(function (label) {
                    indent += tab;
                });
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

        if (this.containsExpectations) {
            if (this.failedExpectations.length) {
                results.failed.push(this);
                if (options.stopAfterFistFailure) {
                    shortCircuit(true);
                }
            } else if (this.passedExpectations.length) {
                results.passed.push(this);
            }
            this.containsExpectations = false;
        }

        // teardown
        if (typeof options.afterEach === 'function') {
            options.afterEach();
        }

        afterRun();
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

    function Spy (original = function(){}, replacement) {
        function spy () {
            let args = Array.prototype.slice.call(arguments);
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
        let original = obj[methodName];
        let spy = Spy(original, replacement);

        if (original) {
            spies[expectContext.depth] = spies[expectContext.depth] || [];
            spies[expectContext.depth].push({
                obj,
                methodName,
                original,
            });

            obj[methodName] = spy;
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

    let clock = {
        _clearTimeout: clearTimeout,
        _clearInterval: clearInterval,
        _setTimeout: setTimeout,
        _setInterval: setInterval,
        _guid: 0,
        _timer: 0,
        _delayedActions: {},

        install: function () {
            if (setTimeout.name !== 'spy') {
                spy.on(global, 'setTimeout', function (fn, delay) {
                    if (typeof fn === 'function') {
                        clock._guid++;
                        clock._delayedActions[clock._guid] = {
                            timestamp: clock._timer,
                            delay: delay || 0,
                            fn: fn,
                        };
                        return clock._guid;
                    }
                });
            }

            if (clearTimeout.name !== 'spy') {
                spy.on(global, 'clearTimeout', function (id) {
                    delete clock._delayedActions[id];
                });
            }

            if (setInterval.name !== 'spy') {
                spy.on(global, 'setInterval', function (fn, delay) {
                    if (typeof fn === 'function') {
                        clock._guid++;
                        clock._delayedActions[clock._guid] = {
                            timestamp: clock._timer,
                            delay: delay || 0,
                            fn: fn,
                            recurring: true,
                        };
                        return clock._guid;
                    }
                });
            }

            if (clearInterval.name !== 'spy') {
                spy.on(global, 'clearInterval', function (id) {
                    delete clock._delayedActions[id];
                });
            }
        },

        tick: function (amount) {
            clock._timer += amount;
            each(clock._delayedActions, function (action, id) {
                if (action) {
                    if (action.recurring) {
                        let times = Math.floor((clock._timer - action.timestamp) / action.delay);
                        for (let i = 0; i < times; i++) {
                            action.fn();
                        }
                    } else {
                        if (clock._timer - action.timestamp >= action.delay) {
                            delete clock._delayedActions[id];
                            action.fn();
                        }
                    }
                }
            });
        },

        uninstall: function () {
            clearTimeout: clock._clearTimeout;
            clearInterval: clock._clearInterval;
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
