describe('clock', function () {

    describe('replaces setTimeout when installed', function (expect) {
        expect(setTimeout.name).not.toBe('spy');

        clock.install();
        expect(setTimeout.name).toBe('spy');

        let happened = 0;
        setTimeout(function () {
            happened++;
        }, 2000);

        clock.tick(2000);
        expect(happened).toBe(1);

        clock.uninstall();
        expect(setTimeout.name).not.toBe('spy');
    });

    describe('replaces setInterval when installed', function (expect) {
        expect(setInterval.name).not.toBe('spy');

        clock.install();
        expect(setInterval.name).toBe('spy');

        let happened = 0;
        setInterval(function () {
            happened++;
        }, 2000);

        clock.tick(6543);
        expect(happened).toBe(3);

        clock.uninstall();
        expect(setInterval.name).not.toBe('spy');
    });

    clock.install();
    describe('clock does not override setTimeout in our test framework', function (expect, done) {
        clock.tick(9999999);
        expect(1).toBe(1);
        done();
    });
    clock.uninstall();

});
