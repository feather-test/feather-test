describe('spy', function () {

    describe('replaces original behavior and restores when done', function (expect) {
        let originalCalled = 0;
        let replacementCalled = 0;
        let obj = {
            method: function (arg) {
                originalCalled += arg;
            }
        };

        describe('replaces original behavior and restores when done', function (expect) {
            expect(originalCalled).toBe(0);
            expect(replacementCalled).toBe(0);
            spyOn(obj, 'method', function (arg) {
                replacementCalled += arg;
            });
            obj.method(1);
            expect(originalCalled).toBe(0);
        });

        obj.method(1);
        expect(originalCalled).toBe(1);
        expect(replacementCalled).toBe(1);
    });

    describe('tracks calls and arguments', function (expect) {
        let obj = {
            method: function(){}
        };
        spyOn(obj, 'method');
        obj.method(4,5,6);
        obj.method(7,8,9);
        expect(obj.method.calls).toBe([
            [4,5,6],
            [7,8,9],
        ]);
    });

});
