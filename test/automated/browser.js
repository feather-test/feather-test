var FeatherTest = require('../../index.js');

module.exports = function () {
    console.log('\nWhen Feather runs in Browser Mode\n');

    var passingTest = new FeatherTest({
        helpers: [
            '../helpers/helper1.js',
            '../helpers/helper2.js'
        ]
    });

    passingTest.queue('../features');
    passingTest.helpers('../helpers/globbed');
    passingTest.browser();
};
