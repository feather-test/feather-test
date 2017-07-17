
describe('handles', function () {

    describe('errors in assertions', function (expect, done) {
        oops();
        expect(true).toBe(false);
        done();
    });

});
