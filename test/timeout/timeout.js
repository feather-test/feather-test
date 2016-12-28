
describe('timeout', function () {

    describe('is handled properly', function (expect, done) {
        setTimeout(function () {
            // not calling done
        }, 10);
    });

});
