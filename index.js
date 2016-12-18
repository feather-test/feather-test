
var fs = require('fs');
var path = require('path');
var matchers = require('./matchers.js');
var utils = require('./utils.js');

var tab = '   ';
var withinTest;
var lastDescribeHadExpectations;
var testQueue;
var passedTests;
var failedTests;
var skippedTests;

function reset () {
    withinTest = void 0;
    lastDescribeHadExpectations = false;
    passedTests = [];
    failedTests = [];
    skippedTests = [];
}

function describe (label, assertions) {
    if (withinTest) {
        var currentTest = arguments.callee.caller.arguments[0];
        var parentsArray = currentTest.parents;
        if (!currentTest.failedExpectations.length && !currentTest.passedExpectations.length) {
            if (lastDescribeHadExpectations) {
                parentsArray.pop();
            }
            parentsArray = parentsArray.concat(currentTest.label);
            lastDescribeHadExpectations = false;
        } else {
            lastDescribeHadExpectations = true;
        }
        runOne({
            label: label,
            assertions: assertions,
            parents: parentsArray
        });

    } else {
        testQueue.push({
            label: label,
            assertions: assertions
        });
    }
}

function xdescribe (label) {
    skippedTests.push(label);
}

function expect (actual) {
    var currentTest = arguments.callee.caller.arguments[0];
    var finalMatchers = matchers.get(currentTest, actual, recordResult);
    finalMatchers.not = matchers.get(currentTest, actual, recordResult, true);
    return finalMatchers;
}

function recordResult (currentTest, passed, negated, result) {
    if ((passed && !negated) || (!passed && negated)) {
        currentTest.passedExpectations.push(result);
    } else {
        currentTest.failedExpectations.push(result);
    }
    currentTest.containsExpectations = true;
}

function runOne (test) {
    withinTest = true;

    var currentTest = {
        label: test.label,
        passedExpectations: [],
        failedExpectations: [],
        containsExpectations: false,
        parents: []
    };

    if (test.parents) {
        currentTest.parents = currentTest.parents.concat(test.parents);
    }

    test.assertions(currentTest);

    if (currentTest.containsExpectations) {
        if (currentTest.failedExpectations.length) {
            failedTests.push(currentTest);
        } else if (currentTest.passedExpectations.length) {
            passedTests.push(currentTest);
        }
        currentTest.containsExpectations = false;
    }
}

function run () {
    reset();

    testQueue.forEach(function (test) {
        runOne(test);
    });

    console.log('\nResults\n------');
    console.log('passed: ' +  passedTests.length);
    console.log('failed: ' + failedTests.length);

    if (skippedTests.length) {
        console.log('skipped: ' + skippedTests.length);
    }

    if (failedTests.length) {
        console.log('\nFailed tests:');
        failedTests.forEach(function (failure) {
            var indent = '';

            console.log(''); // adds line break
            failure.parents.forEach(function (p) {
                console.log(indent + p);
                indent += tab;
            });

            console.log(indent + failure.label);
            failure.failedExpectations.forEach(function (reason) {
                console.log(indent + tab + reason);
            });
        });

    } else if (passedTests.length) {
        console.log('\nAll tests passed!');

    } else {
        console.log('\nNo tests ran.');
    }
}

function specs (dir) {
    testQueue = [];
    var pathToSpecs = path.resolve(path.dirname(module.parent.filename), dir);
    var stats = fs.statSync(pathToSpecs);
    if (stats.isFile()) {
        require(pathToSpecs);

    } else {
        var files = utils.listFiles(pathToSpecs);
        files.forEach(function (file) {
            delete require.cache[file];
            require(file);
        });
    }
}

global.describe = describe;
global.xdescribe = xdescribe;
global.expect = expect;

module.exports = {
    reset: reset,
    run: run,
    specs: specs
};
