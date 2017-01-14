
describe('timeout', function () {

    describe('is handled properly', function (expect, done) {
        oops(); // throwing an error
        // not calling done
    });

});
