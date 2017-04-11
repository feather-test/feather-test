/**
 * Run tests and view output
 */

var FeatherTest = require('../index.js');

console.log('\n\n########## Should Pass ##########');
global.wrongValue = null;
global.featherHelpers = [];

var passingTest = new FeatherTest({
    helpers: [
        './helpers/helper1.js',
        './helpers/helper2.js'
    ]
});
passingTest.queue('./features');
passingTest.helpers('./helpers/globbed');

passingTest.run(function () {
    console.log('\n\n########## Should Fail ##########');
    global.wrongValue = 666;

    var failingTest = new FeatherTest({
        specs: './features'
    });

    failingTest.run(function () {
        console.log('\n\n########## Should Error ##########');

        var erroringTest = new FeatherTest({
            specs: './errors'
        });

        erroringTest.run(function () {
            console.log('\n\n########## Should Time Out ##########');

            var timingOutTest = new FeatherTest({
                specs: './timeout',
                timeout: 500
            });

            timingOutTest.run();
        });
    });
});
