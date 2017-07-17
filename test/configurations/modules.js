const FeatherTest = require('../../index.js');

var testSuite = new FeatherTest({
    specs: '../specs/modules'
});

module.exports = function (callback) {
    testSuite.run(callback);
};
