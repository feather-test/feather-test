/**
 * Run tests and view output
 */

var featherTest = require('../index.js');

console.log('\n\n########## Should Pass ##########');

featherTest.specs('./features');
featherTest.run();

console.log('\n\n########## Should Fail ##########');

global.wrongValue = 666;
featherTest.reset();
featherTest.specs('./features');
featherTest.run();
