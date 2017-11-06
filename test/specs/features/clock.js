describe('clock', function() {
    describe('install', function() {
        var oldSetTimeout = setTimeout;
        var oldSetInterval = setInterval;

        it('replaces setTimeout', function(expect) {
            clock.install();
            expect(setTimeout).not.toBe(oldSetTimeout);
            clock.uninstall();
        });

        it('replaces setInterval', function(expect) {
            clock.install();
            expect(setInterval).not.toBe(oldSetInterval);
            clock.uninstall();
        });

        describe('after installing twice, setTimeout and setInterval work', function(expect) {
            clock.install();
            clock.install();
            var setTimeoutSpy = spy();
            var setIntervalSpy = spy();
            setTimeout(setTimeoutSpy, 100);
            setInterval(setIntervalSpy, 100);
            clock.tick(100);
            expect(setTimeoutSpy).toHaveBeenCalled();
            expect(setIntervalSpy).toHaveBeenCalled();
            expect(setTimeoutSpy.calls.length).toBe(1);
            expect(setIntervalSpy.calls.length).toBe(1);
            clock.tick(100);
            expect(setIntervalSpy.calls.length).toBe(2);
            clock.uninstall();
        });
    });

    describe('uninstall', function() {
        var oldSetTimeout = setTimeout;
        var oldSetInterval = setInterval;

        it('resets setTimeout to its original value', function(expect) {
            clock.install();
            expect(setTimeout).not.toBe(oldSetTimeout);
            clock.uninstall();
            expect(setTimeout).toBe(oldSetTimeout);
        });

        it('resets setInterval to its original value', function(expect) {
            clock.install();
            expect(setInterval).not.toBe(oldSetInterval);
            clock.uninstall();
            expect(setInterval).toBe(oldSetInterval);
        });
    });

    describe('tick', function() {
        describe('setTimeout', function() {
            it('executes a setTimeout when the clock has reached it', function(expect) {
                clock.install();
                var aSpy = spy();
                setTimeout(aSpy, 100);
                expect(aSpy).not.toHaveBeenCalled();
                clock.tick(99);
                expect(aSpy).not.toHaveBeenCalled();
                clock.tick(1);
                expect(aSpy).toHaveBeenCalled();
                clock.uninstall();
            });

            it('dequeues the setTimeout after it has been executed', function(expect) {
                clock.install();
                var aSpy = spy();
                setTimeout(aSpy, 100);
                expect(aSpy).not.toHaveBeenCalled();
                clock.tick(100);
                expect(aSpy.calls.length).toBe(1);
                clock.tick(100);
                expect(aSpy.calls.length).toBe(1);
                clock.uninstall();
            });

            it('passes extra params as arguments to the executed fn', function (expect) {
                clock.install();
                var aSpy = spy();
                setTimeout(aSpy, 100, 3, 'foo');
                clock.tick(100);
                expect(aSpy).toHaveBeenCalledWith(3, 'foo');
                clock.uninstall();
            });

            it('executes setTimeouts that create other setTimeouts', function(expect) {
                clock.install();
                var calls = 0;
                function recursiveFn () {
                    calls++;
                    setTimeout(recursiveFn, 100);
                }
                setTimeout(recursiveFn, 100);
                clock.tick(100);
                expect(calls).toBe(1);
                clock.tick(100);
                expect(calls).toBe(2);
                clock.tick(200);
                expect(calls).toBe(4);
                clock.uninstall();
            });
        });

        describe('setInterval', function() {
            it('executes a setInterval on every interval', function(expect) {
                clock.install();
                var aSpy = spy();
                setInterval(aSpy, 100);
                clock.tick(100); // execute the first time
                expect(aSpy.calls.length).toBe(1);
                clock.tick(100); // run it again
                expect(aSpy.calls.length).toBe(2);
                clock.tick(200); // should run twice
                expect(aSpy.calls.length).toBe(4);
                clock.uninstall();
            });

            it('passes extra params as arguments to the executed fn', function (expect) {
                clock.install();
                var aSpy = spy();
                setInterval(aSpy, 100, 3, 'foo');
                clock.tick(100);
                expect(aSpy.calls[0]).toBe([3, 'foo']);
                clock.tick(100);
                expect(aSpy.calls[1]).toBe([3, 'foo']);
                clock.uninstall();
            });
        });

        it('orders the setTimeouts and setIntervals based on when they should be executed', function(expect) {
            clock.install();
            var calls = [];
            function callback(name) {
                calls.push(name);
            }
            setTimeout(function() {
                callback('first');
                setTimeout(function() {
                    callback('second');
                }, 20);
            }, 100);

            setTimeout(function() {
                callback('third');
            }, 200);

            clock.tick(100);
            expect(calls).toBe(['first']);
            clock.tick(20);
            expect(calls).toBe(['first', 'second']);
            clock.tick(80);
            expect(calls).toBe(['first', 'second', 'third']);
            clock.uninstall();
        });

    });

    describe('separation from framework internals', function() {

        clock.install();

        describe('clock does not override setTimeout in our test framework', function(expect, done) {
            clock.tick(9999); // would trigger the timeout for this describe block
            expect(1).toBe(1);
            done();
        });

        let crossoverTimeout = 0;
        let crossoverInterval = 0;

        describe('queued actions are reset between describe blocks', function() {
            setTimeout(function() {
                crossoverTimeout++;
            }, 1000);
            setInterval(function() {
                crossoverInterval++;
            }, 1000);
        });

        setTimeout(function() {
            crossoverTimeout++;
        }, 1000);

        describe('queued actions are reset before and after describe blocks', function(expect) {
            let internalTimeout = 0;
            let internalInterval = 0;

            clock.tick(2001);

            describe('pending inner timeout should be cleared when describe is done', function(expect, done) {
                setTimeout(function() {
                    internalTimeout++;
                }, 1000);
                done();
            });

            setTimeout(function() {
                internalTimeout++;
            }, 1000);

            setInterval(function() {
                internalInterval++;
            }, 1000);

            clock.tick(2001);

            expect(internalTimeout).toBe(1, 'internalTimeout');
            expect(internalInterval).toBe(2, 'internalInterval');
            expect(crossoverTimeout).toBe(0, 'crossoverTimeout');
            expect(crossoverInterval).toBe(0, 'crossoverInterval');
        });

        clock.uninstall();

    });
});
