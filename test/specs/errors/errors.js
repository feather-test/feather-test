
describe('handles', function () {

    describe('errors in assertions', function () {

        it('catches errors when sync', function (expect) {
            oops();
            expect(true).toBe(false);
        });

        it('catches errors when async', function (expect, done) {
            oops();
            expect(true).toBe(false);
            done();
        });

    });

    describe('missing expectations', function () {

        it('requires at least one expect when sync', function (expect) {

        });

        it('requires at least one expect when async', function (expect, done) {
            done();
        });

    });

});
