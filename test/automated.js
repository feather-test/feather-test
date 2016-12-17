/**
 * Run automated validations
 */

var featherTest = require('../index.js');
var utils = require('../utils.js');

// override console.log so we can validate output
var logs = [];
var oldLog = console.log;
console.log = function (msg) {
    logs.push(msg);
};

function validateOutput (actual, expected) {
    var unexpectedResults = false;
    utils.each(actual, function (entry, i) {
        if (entry !== expected[i]) {
            oldLog('   ✘ Expected "' + entry + '" to read "' + expected[i] + '"');
            unexpectedResults = true;
            return false;
        }
    });
    if (!unexpectedResults) {
        oldLog('   ✔ output is good');
    }
}

featherTest.specs('./features');
featherTest.run();

oldLog('\nWhen Feather is Passing\n');
logs.shift();
validateOutput(logs, [
    'passed: 8',
    'failed: 0',
    'skipped: 1',
    '\nAll tests passed!'
]);

global.wrongValue = 666;

logs = [];
featherTest.reset();
featherTest.specs('./features');
featherTest.run();

oldLog('\nWhen Feather is Failing\n');
logs.shift();
validateOutput(logs, [
  'passed: 0',
  'failed: 8',
  'skipped: 1',
  '\nFailed tests:',
  '',
  'matchers',
  '   Expected "true" to be "666" ',
  '   Expected "{"a":1,"b":{"c":2}}" to be "666" ',
  '   Expected "[123,{"a":1}]" to equal "666" ',
  '   Expected "{}" to equal "666" ',
  '   Expected "99" to be greater than "666" ',
  '   Expected "999" to be less than "666" ',
  '   Expected "abc123def" to contain "666" ',
  '',
  'negated',
  '   when mogwai gets wet',
  '      he becomes a gremlin',
  '         Expected "smooth" not to be "smooth" ',
  '         Expected "angry" to be "666" ',
  '',
  'two stuff',
  '   when it gets wet',
  '      shrinks',
  '         Expected "1" to be "666" ',
  '',
  'two stuff',
  '   when it gets wet',
  '      does not grow',
  '         Expected "2" to be "666" ',
  '',
  'two stuff',
  '   when it gets wet',
  '      Expected "unnested" to be "666" ',
  '',
  'two stuff',
  '   when it dries out',
  '      grows',
  '         Expected "3" to be "666" ',
  '',
  'two stuff',
  '   when it dries out',
  '      does not shrink',
  '         Expected "4" to be "666" ',
  '',
  'three stuff',
  '   Expected "5" to be "666" extra messages too!'
]);
