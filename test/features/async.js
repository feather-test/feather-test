
describe('async', function () {

    describe('asserts expectations now and later', function (expect, done) {

        expect(global.wrongValue || 'outer').toBe('outer');

        setTimeout(function () {
            expect(global.wrongValue || 3).toBe(3);
            done();
        }, 10);

    });

});
