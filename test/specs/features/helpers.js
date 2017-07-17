
describe('helpers', function () {

    describe('are loaded before the specs', function (expect) {
        expect(global.featherHelpers).toBe([
            'helper1',
            'helper2',
            'helper3',
            'helper4'
        ]);
    });

});
