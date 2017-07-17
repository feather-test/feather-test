
var one = require('../fixture/one.js');

describe('two.spec', function () {

    describe('gets fresh modules', function (expect) {
        expect(one.two.name).toBe('two');
        expect(one.three.name).toBe('three');
    });

});
