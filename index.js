
// add the ability to use mocks
require('require-cache-mock');

var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var matchers = require('./matchers.js');
var utils = require('./utils.js');

var tab = '   ';
var helpersQueue = [];
var testQueue = [];
var pendingAsync;
var pendingSync;
var passedTests;
var failedTests;
var skippedTests;
var afterRun;
var shortCircuit;

var options = {
    stopAfterFistFailure: false,
    timeout: 5000
};

var expectContext = {
    labels: []
};

function reset () {
    pendingAsync = 0;
    pendingSync = 0;
    passedTests = [];
    failedTests = [];
    skippedTests = [];
}

function hasPending () {
    return pendingSync > 0 || pendingAsync > 0;
}

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
        var finalMatchers = matchers.get(this, tab, actual, recordResult);
        finalMatchers.not = matchers.get(this, tab, actual, recordResult, true);
        return finalMatchers;
    }

    var clonedExpectContext = utils.clone(expectContext);
    var assertionArgs = [ expect.bind(clonedExpectContext) ];
    if (async) {
        clonedExpectContext.async = true;
        assertionArgs.push(describeDone.bind(clonedExpectContext));
        clonedExpectContext.timeout = setTimeout(function () {
            output(chalk.yellow('\nSpec timed out!\n'));
            var indent = '';
            clonedExpectContext.labels.forEach(function (label) {
                output(indent + label);
                indent += tab;
            });
            output(indent + 'should call done() within ' + options.timeout + 'ms');
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
            failedTests.push(this);
            if (options.stopAfterFistFailure) {
                shortCircuit(true);
            }
        } else if (this.passedExpectations.length) {
            passedTests.push(this);
        }
        this.containsExpectations = false;
    }

    afterRun();
}

function xdescribe (label) {
    skippedTests.push(label);
}

function recordResult (currentTest, passed, negated, result) {
    if ((passed && !negated) || (!passed && negated)) {
        currentTest.passedExpectations.push(result);
    } else {
        currentTest.failedExpectations.push(result);
    }
    currentTest.containsExpectations = true;
}

function reportResults () {
    if (failedTests.length) {
        output('\nFailed tests:');
        failedTests.forEach(function (failure) {
            var indent = '';
            output(''); // adds line break
            failure.labels.forEach(function (label) {
                output(indent + label);
                indent += tab;
            });
            failure.failedExpectations.forEach(function (reason) {
                output(reason, indent);
            });
        });
        output(chalk.red('\n' + failedTests.length + ' tests failed!'));

    } else if (passedTests.length) {
        output(chalk.green('\nAll ' + passedTests.length + ' tests passed!'));

    } else {
        output('\nNo tests ran.');
    }

    if (skippedTests.length) {
        output('\n(' + skippedTests.length + ' tests skipped)');
    }
}

function output (msg, indent) {
    console.log(msg.replace(/\%\%/g, indent));
}

function clearRequireCache () {
    for (var x in require.cache) {
        delete require.cache[x];
    }
}

function run (callback) {
    var allParsed = false;

    shortCircuit = function (withReport) {
        if (withReport) {
            reportResults();
        }
        afterRun = function(){};
        shortCircuit = function(){};
        if (typeof callback === 'function') {
            callback(true, {});
        }
    };

    afterRun = function () {
        if (allParsed && !hasPending()) {
            reportResults();
            if (typeof callback === 'function') {
                callback(!!failedTests.length, { passed: passedTests, failed: failedTests, skipped: skippedTests });
            }
        }
    };

    if (pendingSync) {
        output('Please wait. ' + pendingSync + ' tests are still running.');
    } else {
        reset();

        helpersQueue.forEach(function (hq) {
            var pathToHelpers = path.resolve(path.dirname(module.parent.filename), hq);
            var stats = fs.statSync(pathToHelpers);
            if (stats.isFile()) {
                require(pathToHelpers);

            } else {
                var files = utils.listFiles(pathToHelpers);
                files.forEach(function (file) {
                    require(file);
                });
            }
        });

        testQueue.forEach(function (tq) {
            var pathToSpecs = path.resolve(path.dirname(module.parent.filename), tq);
            var stats = fs.statSync(pathToSpecs);
            if (stats.isFile()) {
                clearRequireCache();
                require(pathToSpecs);

            } else {
                var files = utils.listFiles(pathToSpecs);
                files.forEach(function (file) {
                    clearRequireCache();
                    require(file);
                });
            }
        });

        allParsed = true;
        afterRun();
    }
}

function helpers (dir) {
    if (dir === null) {
        helpersQueue = [];

    } else {
        if (Array.isArray(dir)) {
            dir.forEach(function (d) {
                helpersQueue.push(d);
            });
        } else {
            helpersQueue.push(dir);
        }
    }

    return {
        queue: queue,
        run: run
    };
}

function queue (dir) {
    testQueue.push(dir);
    return {
        run: run,
        queued: testQueue
    };
}

function unqueue (dir) {
    if (dir) {
        var dirAt = testQueue.indexOf(dir);
        if (dirAt !== -1) {
            testQueue.splice(dirAt, 1);
        }
    } else {
        testQueue = [];
    }
}


global.describe = describe;
global.xdescribe = xdescribe;

// make it easy to switch to feather from jasmine
global.it = describe;
global.xit = xdescribe;

module.exports = {
    options: options,
    helpers: helpers,
    run: run,
    queue: queue,
    unqueue: unqueue
};
