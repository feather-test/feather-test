const FeatherTest = require('../../index.js');

var testSuite = new FeatherTest({
    specs: '../specs/errors'
});

module.exports = function (callback) {
    testSuite.run(callback);
};
