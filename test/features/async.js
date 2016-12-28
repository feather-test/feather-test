
describe('async', function () {

    describe('asserts expectations eventually', function (expect, done) {
        setTimeout(function () {
            expect(global.wrongValue || 3).toBe(3);
            done();
        }, 10);
    });

});
