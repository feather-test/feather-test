
describe('Any', function (expect) {

    expect(false).toBe(any(Boolean));
    expect(123).toBe(any(Number));
    expect('foo').toBe(any(String));
    expect(function(){}).toBe(any(Function));
    expect([]).toBe(any(Array));
    expect([123, function(){}]).toBe([any(Number), any(Function)]);
    expect({}).toBe(any(Object));
    expect({ a: { b:2 } }).toBe({ a: any(Object) });

});
