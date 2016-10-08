
describe('matchers', function () {
    expect(true).toBe(global.wrongValue || true);
    expect('abc123def').toContain(global.wrongValue || '123');
});
