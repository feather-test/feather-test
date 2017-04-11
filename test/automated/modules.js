var FeatherTest = require('../../index.js');

module.exports = function (LOG, validate, callback) {
    LOG.history = [];

    var modulesTest = new FeatherTest({
        specs: '../modules'
    });

    modulesTest.run(function () {
        LOG.out('\nWhen Feather Mutates Modules\n');
        validate.all(LOG.history, [
            '\nAll 3 tests passed!'
        ]);
        callback();
    });
};
