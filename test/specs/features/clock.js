describe('clock', function () {

    describe('replaces setTimeout when installed', function (expect) {
        expect(setTimeout.name).not.toBe('featherSetTimeout');

        clock.install();
        expect(setTimeout.name).toBe('featherSetTimeout');

        let happened = 0;
        setTimeout(function (num) {
            happened += num;
        }, 2000, 3);

        clock.tick(2000);
        expect(happened).toBe(3);

        clock.uninstall();
        expect(setTimeout.name).not.toBe('featherSetTimeout');
    });

    describe('replaces setInterval when installed', function (expect) {
        expect(setInterval.name).not.toBe('featherSetInterval');

        clock.install();
        expect(setInterval.name).toBe('featherSetInterval');

        let happened = 0;
        setInterval(function (num) {
            happened += num;
        }, 2000, 3);

        clock.tick(6543);
        expect(happened).toBe(9);

        clock.uninstall();
        expect(setInterval.name).not.toBe('featherSetInterval');
    });

    clock.install();

        describe('clock does not override setTimeout in our test framework', function (expect, done) {
            clock.tick(9999); // would trigger the timeout for this describe block
            expect(1).toBe(1);
            done();
        });

        let crossoverTimeout = 0;
        let crossoverInterval = 0;

        describe('queued actions are rest between describe blocks', function () {
            setTimeout(function () {
                crossoverTimeout++;
            }, 1000);
            setInterval(function () {
                crossoverInterval++;
            }, 1000);
        });

        setTimeout(function () {
            crossoverTimeout++;
        }, 1000);

        describe('queued actions are rest before and after describe blocks', function (expect) {
            let internalTimeout = 0;
            let internalInterval = 0;

            clock.tick(2001);

            describe('pending inner timeout should be cleared when describe is done', function (expect, done) {
                setTimeout(function () {
                    internalTimeout++;
                }, 1000);
                done();
            });

            setTimeout(function () {
                internalTimeout++;
            }, 1000);

            setInterval(function () {
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
