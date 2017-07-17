const FeatherTest = require('../../index.js');

var testSuite = new FeatherTest({
    exitProcessWhenFailing: false,
    specs: '../specs/timeout',
    timeout: 100
});

module.exports = function (callback) {
    testSuite.run(callback);
};
