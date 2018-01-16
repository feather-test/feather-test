var executionOrder = [];

describe('sponge', function () {

    executionOrder.push(1);

    describe('when it gets wet', function (expect) {

        executionOrder.push(2);

        describe('grows', function (expect) {
            executionOrder.push(3);
            expect('larger').toBe(global.wrongValue || 'larger');
        });

        executionOrder.push(4);

        describe('does not shrink', function (expect) {
            executionOrder.push(5);
            expect('same').toBe(global.wrongValue || 'same');
        });

        expect('unnested').toBe(global.wrongValue || 'unnested');

        executionOrder.push(6);

        expect(executionOrder).toBe([1,2,3,4,5,6]);

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
