
var fs = require('fs');
var path = require('path');
var matchers = require('./matchers.js');
var utils = require('./utils.js');

var tab = '   ';
var testQueue = [];
var pendingDescribes;
var passedTests;
var failedTests;
var skippedTests;
var afterRun;

var options = {
    timeout: 5000
};

var expectContext = {
    labels: []
};

function reset () {
    pendingDescribes = 0;
    passedTests = [];
    failedTests = [];
    skippedTests = [];
}

function describe (label, assertions) {
    pendingDescribes++;
    var async = assertions.length > 1;

    // preserve labels from parent describes
    expectContext.labels.push(label);

    // reset expectations
    expectContext.passedExpectations = [];
    expectContext.failedExpectations = [];
    expectContext.containsExpectations = false;


    var expect = function (actual) {
        var finalMatchers = matchers.get(this, actual, recordResult);
        finalMatchers.not = matchers.get(this, actual, recordResult, true);
        return finalMatchers;
    }

    var clonedExpectContext = utils.clone(expectContext);
    var assertionArgs = [ expect.bind(clonedExpectContext) ];
    if (async) {
        clonedExpectContext.async = true;
        assertionArgs.push(describeDone.bind(clonedExpectContext));
        clonedExpectContext.timeout = setTimeout(function () {
            output('\nSpec timed out!\n');
            var indent = '';
            clonedExpectContext.labels.forEach(function (label) {
                output(indent + label);
                indent += tab;
            });
            output(indent + 'should call done() within ' + options.timeout + 'ms');
            if (clonedExpectContext.failedExpectations.length) {
                output(clonedExpectContext.failedExpectations[0]);
            }
            if (typeof afterRun === 'function') {
                afterRun();
            }
        }, options.timeout);
    }

    try {
        assertions.apply(clonedExpectContext, assertionArgs);
    } catch (err) {
        recordResult(clonedExpectContext, false, false, err.stack);
    }

    expectContext.labels.pop();
    if (!async) {
        describeDone.apply(clonedExpectContext);
    }
}

function describeDone () {
    clearTimeout(this.timeout);
    pendingDescribes--;

    if (this.containsExpectations) {
        if (this.failedExpectations.length) {
            failedTests.push(this);
        } else if (this.passedExpectations.length) {
            passedTests.push(this);
        }
        this.containsExpectations = false;
    }

    if (this.async && pendingDescribes <= 0) {
        reportResults();
    }
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
    output('\nResults\n------');
    output('passed: ' +  passedTests.length);
    output('failed: ' + failedTests.length);

    if (skippedTests.length) {
        output('skipped: ' + skippedTests.length);
    }

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
                output(indent + reason);
            });
        });

    } else if (passedTests.length) {
        output('\nAll tests passed!');

    } else {
        output('\nNo tests ran.');
    }

    if (typeof afterRun === 'function') {
        afterRun();
    }
}

function output (msg) {
    console.log(msg);
}

function run (callback) {
    afterRun = callback;

    if (pendingDescribes) {
        output('Please wait. ' + pendingDescribes + ' tests are still running.');
    } else {
        reset();
        testQueue.forEach(function (tq) {
            var pathToSpecs = path.resolve(path.dirname(module.parent.filename), tq);
            var stats = fs.statSync(pathToSpecs);
            if (stats.isFile()) {
                delete require.cache[require.resolve(pathToSpecs)];
                require(pathToSpecs);

            } else {
                var files = utils.listFiles(pathToSpecs);
                files.forEach(function (file) {
                    delete require.cache[file];
                    require(file);
                });
            }
        });

        if (pendingDescribes <= 0) {
            reportResults();
        }
    }
}

function queue (dir) {
    testQueue.push(dir);
    return {
        run: run
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

module.exports = {
    options: options,
    run: run,
    queue: queue,
    unqueue: unqueue
};
