
describe('sponge', function () {

    describe('when it gets wet', function (expect) {

        describe('grows', function (expect) {
            expect('larger').toBe(global.wrongValue || 'larger');
        });

        describe('does not shrink', function (expect) {
            expect('same').toBe(global.wrongValue || 'same');
        });

        expect('unnested').toBe(global.wrongValue || 'unnested');

    });

    describe('when it dries out', function (expect) {

        expect('unnested').toBe(global.wrongValue || 'unnested');

        xdescribe('can be ignored', function (expect) {
            expect('this test').toBe('unasserted');
        });

        describe('shrinks', function (expect) {
            expect('smaller').toBe(global.wrongValue || 'smaller');
        });

    });

});

describe('additional outer blocks', function (expect) {
    expect('extra').toBe(global.wrongValue || 'extra', 'extra messages too!');
});
