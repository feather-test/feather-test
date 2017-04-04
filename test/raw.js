/**
 * Run tests and view output
 */

var featherTest = require('../index.js');

console.log('\n\n########## Should Pass ##########');
global.wrongValue = null;
featherTest.unqueue();
featherTest.queue('./features');

global.featherHelpers = [];
featherTest.helpers([
    './helpers/helper1.js',
    './helpers/helper2.js'
]);
featherTest.helpers('./helpers/globbed');

featherTest.run(function () {
    featherTest.helpers(null);
    console.log('\n\n########## Should Fail ##########');
    global.wrongValue = 666;
    featherTest.unqueue();
    featherTest.queue('./features');

    featherTest.run(function () {
        console.log('\n\n########## Should Error ##########');
        featherTest.unqueue();
        featherTest.queue('./errors');

        featherTest.run(function () {
            console.log('\n\n########## Should Time Out ##########');
            featherTest.options.timeout = 500;
            featherTest.unqueue();
            featherTest.queue('./timeout');

            featherTest.run();
        });
    });
});
