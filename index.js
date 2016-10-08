
var path = require('path');
var utils = require('./utils.js');

var tab = '   ';
var currentTest;
var lastDescribeHadExpectations;
var testQueue;
var passedTests;
var failedTests;

function reset () {
    currentTest = void 0;
    lastDescribeHadExpectations = false;
    passedTests = [];
    failedTests = [];
}

function describe (label, assertions) {
    if (currentTest) {
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

function getMatchers (expected, negated) {
    var neg = negated ? ' not' : '';
    return {
        toBe: function (actual, msg) {
            var result = 'Expected "' + expected + '"' + neg + ' to be "' + actual + '" ' + (msg || '');
            recordResult(actual === expected, negated, result);
        },
        toContain: function (actual, msg) {
            var result = 'Expected "' + expected + '"' + neg + ' to contain "' + actual + '" ' + (msg || '');
            recordResult(expected.indexOf(actual) !== -1, negated, result);
        }
    }
}

function expect (expected) {
    var matchers = getMatchers(expected);
    matchers.not = getMatchers(expected, true);
    return matchers;
}

function recordResult (passed, negated, result) {
    if ((passed && !negated) || (!passed && negated)) {
        currentTest.passedExpectations.push(result);
    } else {
        currentTest.failedExpectations.push(result);
    }
    currentTest.containsExpectations = true;
}

function runOne (test) {
    currentTest = {
        label: test.label,
        passedExpectations: [],
        failedExpectations: [],
        containsExpectations: false,
        parents: []
    };

    if (test.parents) {
        currentTest.parents = currentTest.parents.concat(test.parents);
    }

    test.assertions();

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
    var files = utils.listFiles(pathToSpecs);
    files.forEach(function (file) {
        delete require.cache[file];
        require(file);
    });
}

global.describe = describe;
global.expect = expect;

module.exports = {
    reset: reset,
    run: run,
    specs: specs
};
