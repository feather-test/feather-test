
describe('matchers', function () {
    expect(true).toBe(global.wrongValue || true);
    expect({ a:1, b:{ c:2 } }).toBe(global.wrongValue || { a:1, b:{ c:2 } });
    expect([123, {a:1}]).toEqual(global.wrongValue || [123, {a:1}]);
    expect(99).toBeGreaterThan(global.wrongValue || 1);
    expect(999).toBeLessThan(global.wrongValue || 1000);
    expect('abc123def').toContain(global.wrongValue || '123');
});
