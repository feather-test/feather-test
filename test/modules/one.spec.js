
var mock = require('mock-require');

mock('../fixture/sub/three.js', { name: 'mocked' });
var one = require('../fixture/one.js');
mock.stopAll();

describe('one.spec', function () {

    describe('uses the intended modules', function (expect) {
        expect(one.two.name).toBe('two');
        expect(one.three.name).toBe('mocked');
    });

    one.two.name = 'mutated';

    describe('still references the same (mutated) module', function (expect) {
        expect(one.two.name).toBe('mutated');
    });

});
