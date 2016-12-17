
describe('two stuff', function () {

    describe('when it gets wet', function () {

        describe('shrinks', function () {
            expect(1).toBe(global.wrongValue || 1);
        });

        describe('does not grow', function () {
            expect(2).toBe(global.wrongValue || 2);
        });

        expect('unnested').toBe(global.wrongValue || 'unnested');

    });

    describe('when it dries out', function () {

        describe('grows', function () {
            expect(3).toBe(global.wrongValue || 3);
        });

        xdescribe('can be ignored', function () {
            expect('this test').toBe('unasserted');
        });

        describe('does not shrink', function () {
            expect(4).toBe(global.wrongValue || 4);
        });

    });

});

describe('three stuff', function () {
    expect(5).toBe(global.wrongValue || 5, 'extra messages too!');
});
