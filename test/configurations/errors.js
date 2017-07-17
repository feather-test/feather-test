const FeatherTest = require('../../index.js');

var testSuite = new FeatherTest({
    exitProcessWhenFailing: false,
    specs: '../specs/errors'
});

module.exports = function (callback) {
    testSuite.run(callback);
};
