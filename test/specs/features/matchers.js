
let obj = {
    method: function () {},
};

function fn () {}

describe('matchers', function (expect) {
    spy.on(obj, 'method');

    if (!global.wrongValue) {
        obj.method();
        obj.method(4,5,6);
    }

    expect(true).toBe(global.wrongValue || true);
    expect({ a:1, b:{ c:2 } }).toBe(global.wrongValue || { a:1, b:{ c:2 } });
    expect({ fn: fn }).toBe(global.wrongValue || { fn: fn });
    expect([123, {a:1}]).toEqual(global.wrongValue || [123, {a:1}]);
    expect({}).toEqual(global.wrongValue || {});
    expect(99).toBeGreaterThan(global.wrongValue || 1);
    expect(999).toBeLessThan(global.wrongValue || 1000);
    expect('abc123def').toContain(global.wrongValue || '123');
    expect(obj.method).toHaveBeenCalled();
    expect(obj.method).toHaveBeenCalledWith(4,5,any(Number));
    expect(123).myCustomMatcher(global.wrongValue || 369);

    describe('toContain', function () {
        expect('thesuperbowl').toContain('superb');
        expect([1, 2, '3']).toContain('3');
        expect([1, 2, 3]).toContain(3);
        expect([1, 2, 3]).toContain([3]);
        expect([1, 2, 3]).not.toContain([3, 4]);
        expect([1, 2, 3]).toContain([1, 2, 3]);
        expect(undefined).not.toContain('some value');
        expect(null).not.toContain('some value');
        expect(new Set()).not.toContain('some value');

        var mySet = new Set();
        mySet.add(1);
        mySet.add(2);
        expect(mySet).toContain(2);
    });
});
