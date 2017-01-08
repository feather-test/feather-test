
describe('handles errors in assertions', function (expect) {
    oops();
    expect(true).toBe(true);
});
