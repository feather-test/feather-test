
var one = require('../fixture/one.js');

describe('one.spec', function () {

    describe('uses the intended modules', function (expect) {
        expect(one.two.name).toBe('two');
        expect(one.three.name).toBe('three');
    });

    one.two.name = 'mutated';

    describe('still references the same (mutated) module', function (expect) {
        expect(one.two.name).toBe('mutated');
    });

});
