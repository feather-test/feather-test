describe('spy', function () {

    describe('replaces original behavior and restores when done', function (expect) {
        var originalCalled = 0;
        var replacementCalled = 0;
        var obj = {
            method: function (arg) {
                originalCalled += arg;
            }
        };

        describe('replaces original behavior and restores when done', function (expect) {
            expect(originalCalled).toBe(0);
            expect(replacementCalled).toBe(0);
            var spiedMethod = spy.on(obj, 'method', function (arg) {
                replacementCalled += arg;
            });

            describe('inside1', function () {
                describe('inside2', function () {
                    obj.method(1);
                });
            });

            obj.method(1);
            spiedMethod(1);
            expect(originalCalled).toBe(0);
        });

        obj.method(1);
        expect(originalCalled).toBe(1);
        expect(replacementCalled).toBe(3);
    });

    describe('tracks calls and arguments', function (expect) {
        var obj = {
            method: function(){}
        };
        var spiedMethod = spy.on(obj, 'method');
        obj.method(4,5,6);
        obj.method(7,8,9);
        expect(obj.method.calls).toBe([
            [4,5,6],
            [7,8,9],
        ]);
        expect(spiedMethod.calls).toBe([
            [4,5,6],
            [7,8,9],
        ]);
    });

    describe('can be created from scratch', function (expect) {
        var replaced = false;
        var s = spy(function (v) {
            replaced = v;
        });
        expect(typeof s).toBe('function');
        expect(s.name).toBe('spy');
        expect(s.calls).toBe([]);
        s(true);
        expect(s.calls).toBe([[true]]);
        expect(replaced).toBe(true);
    });

    describe('works asyncronously', function () {

        describe('works with setTimeout', function (expect, done) {
            var originalCalled = 0;
            var replacementCalled = 0;
            var obj = {
                method: function (arg) {
                    originalCalled += arg;
                }
            };

            function validate() {
                expect(originalCalled).toBe(0);
                expect(replacementCalled).toBe(1);
                done();
            }

            spy.on(obj, 'method', function (arg) {
                replacementCalled += arg;
            });

            describe('inside1', function () {
                describe('inside2', function () {
                    setTimeout(function () {
                        obj.method(1);
                        validate();
                    }, 10);
                });
            });
        });

        describe('works with Promise', function (expect, done) {
            var originalCalled = 0;
            var replacementCalled = 0;
            var obj = {
                method: function (arg) {
                    originalCalled += arg;
                }
            };

            function validate() {
                expect(originalCalled).toBe(0);
                expect(replacementCalled).toBe(2);
                done();
            }

            spy.on(obj, 'method', function (arg) {
                replacementCalled += arg;
            });

            describe('inside1', function () {
                describe('inside2', function () {
                    let p = new Promise((resolve, reject) => {
                        obj.method(1);
                        setTimeout(() => {
                            resolve();
                        }, 10);
                    });
                    p.then((success) => {
                        obj.method(1);
                        validate();
                    });
                });
            });
        });
    });

});
