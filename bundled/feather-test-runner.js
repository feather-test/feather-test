var clone = require('./clone.js');
var matchers =  require('./matchers.js');
var reporter = require('./reporter.js');

function FeatherTest (options) {
    if (!this instanceof FeatherTest) {
        return new FeatherTest();
    }

    var root = typeof global !== 'undefined' ? global : window;
    var tab = '   ';
    var shortCircuit;
    var afterRun;
    var allParsed;
    var expectContext = {
        labels: []
    };


    /* RESET */

    var pendingAsync;
    var pendingSync;
    var pendingCallback;
    var results = {
        passed: [],
        failed: [],
        skipped: []
    };

    function reset () {
        pendingAsync = 0;
        pendingSync = 0;
        pendingCallback = null;
        results.passed = [];
        results.failed = [];
        results.skipped = [];
    }


    /* DESCRIBES & EXPECTS */

    function describe (label, assertions) {
        var async = assertions.length > 1;

        if (async) {
            pendingAsync++;
        } else {
            pendingSync++;
        }

        // preserve labels from parent describes
        expectContext.labels.push(label);

        // reset expectations
        expectContext.passedExpectations = [];
        expectContext.failedExpectations = [];
        expectContext.containsExpectations = false;


        var expect = function (actual) {
            var lineMap = getLineMap(new Error());
            var finalMatchers = matchers.get(this, tab, actual, lineMap, recordResult);
            finalMatchers.not = matchers.get(this, tab, actual, lineMap, recordResult, true);
            return finalMatchers;
        }

        var clonedExpectContext = clone(expectContext);
        var assertionArgs = [ expect.bind(clonedExpectContext) ];
        if (async) {
            clonedExpectContext.async = true;
            assertionArgs.push(describeDone.bind(clonedExpectContext));
            clonedExpectContext.timeout = setTimeout(function () {
                reporter.output('\nSpec timed out!\n');
                var indent = '';
                clonedExpectContext.labels.forEach(function (label) {
                    reporter.output(indent + label);
                    indent += tab;
                });
                reporter.output(indent + 'should call done() within ' + options.timeout + 'ms');
                shortCircuit();
            }, options.timeout);
        }

        try {
            assertions.apply(clonedExpectContext, assertionArgs);
        } catch (err) {
            clonedExpectContext.failedExpectations = []; // clear failed expectations to make room for the error
            recordResult(clonedExpectContext, false, false, '\n' + (err.stack || err));
            expectContext.labels.pop();
            describeDone.apply(clonedExpectContext);
            return;
        }

        expectContext.labels.pop();
        if (!async) {
            describeDone.apply(clonedExpectContext);
        }
    }

    function describeDone () {
        clearTimeout(this.timeout);

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

        afterRun();
    }

    function getLineMap (err) {
        if (err.stack) {
            var line = err.stack.split('\n')[2];
            if (line.indexOf(' (') !== -1) {
                line = line.split(' (')[1];
                line = line.substring(0, line.length - 1);
            } else {
                line = line.split('at ')[1];
            }

            return '@' + line;
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
            reporter.report(results, tab);
        }
        afterRun = function(){};
        shortCircuit = function(){};
        if (typeof pendingCallback === 'function') {
            pendingCallback();
        }
    };

    afterRun = function () {
        if (allParsed && !hasPending()) {
            reporter.report(results, tab);
            if (typeof pendingCallback === 'function') {
                pendingCallback();
            }
        }
    };


    /* PUBLIC */

    // Activate the test and listen for any describes to be executed
    function listen () {
        root.describe = describe;
        root.xdescribe = xdescribe;
        root.it = describe; // make it easy to switch to feather from jasmine
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
        listen: listen,
        report: report
    };
}


module.exports = FeatherTest;
