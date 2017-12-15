# feather-test

<img src="https://travis-ci.org/feather-test/feather-test.svg?branch=master"></img>

**Extremely lightweight JavaScript test coverage**

*Refactor safely -- without configuring a burdensome test suite*

> Need to test JavaScript for browsers? Use [feather-test-browser](https://github.com/seebigs/feather-test-browser)

## Install
```
$ npm install feather-test --save-dev
```

## Write Some Tests

*myProject/test/specs/one.spec.js*
```js
describe('gizmo is a mogwai', function () {

    describe('when you feed him after midnight', function () {

        describe('he becomes a gremlin', function (expect) {
            expect(skin).not.toBe('furry');
            expect(temperament).toContain('angry');
            expect(explosions).toBeGreaterThan(99, 'explosions caused by gremlins');
        });

    });

});
```

*myProject/test/specs/two.spec.js*
```js
// example of an asynchronous test
describe('teddy ruxpin is the creepiest bear ever', function () {

    describe('he blinks twice every 3 seconds', function (expect, done) {
        activateTeddy();
        setTimeout(function () {
            expect(timesBlinked).toBe(4);
            done();
        }, 6000);
    });

});
```

*myProject/package.json*
```js
{
  "scripts": {
    "test": "node ./test/run"    
  }
}
```

```
myProject/
  |--test/
  |  |--specs/
  |  |  |--one.spec.js
  |  |  |--two.spec.js
  |  |--run.js
  |--src/
  |  |--etc.
  |--package.json
```

## Run Your Tests
*myProject/test/run.js*
```js
var FeatherTest = require('feather-test');

// create a new FeatherTest with your spec files
var myTests = new FeatherTest({
    helpers: './helpers',
    specs: './specs'
});

// run all queued tests by calling `run`
// (optional callback will be executed after all tests finish)
myTests.run(callback);
```

```
$ cd myProject
$ npm test

// All 4 tests passed!
```

---

## Matchers
*Any of the below can also be negated using not.toBe, etc.*

- toBe
- toBeGreaterThan
- toBeLessThan
- toContain
- toEqual
- toHaveBeenCalled
- toHaveBeenCalledWith

## Spec Methods
*The following methods are globally available within spec files*

### describe
The basic building block of specs. A description explains what features will be tested within. (can be nested)
```js
describe('some feature', function () {
    describe('can do a thing', function (expect) {
        expect(thing).toBe(true);
    });
});
```

### xdescribe
Skips this block and all assertions within. Also skips nested describes.
```js
xdescribe('not right now', function (expect) {
    expect(thisBlock).not.toBe('executed');
});
```

### it, xit
Alias for `describe` (above). Added to make migrations easier

### any
Use with matchers to indicate a match with and object that shares the same constructor
```js
expect(result).toBe({
    eventName: 'activated',
    timestamp: any(Number)
});
```

### clock
Manage timing events. Installing will add a global override for `setTimeout` and `setInterval`. To advance the clock use `clock.tick(amount)`.
```js
describe('overrides setTimeout when installed', function (expect) {
    clock.install();

    let happened = 0;
    setTimeout(function () {
        happened++;
    }, 2000);

    expect(happened).toBe(0);
    clock.tick(2000);
    expect(happened).toBe(1);

    clock.uninstall();
});
```

### spy
Stub or mock any function or method.

`spy.on()` watches and counts each invocation.
```js
describe('no double agents here', function (expect) {
    let obj = {
        method: function () {
            return 'original';
        }
    };

    expect(obj.method()).toBe('original');

    describe('put on your disguise', function (expect) {
        spy.on(obj, 'method', function () {
            return 'impostor';
        });
        expect(obj.method()).toBe('impostor');
    });

    // spies are reset after the containing describe is done
    expect(obj.method()).toBe('original');
});
```
`spy()` creates a new spy.
```js
describe('your secret training is complete', function (expect) {
    let doubleOhSeven = spy(() => { return { license: 'kill'}; });
    expect(doubleOhSeven().license).toBe('kill');
    expect(doubleOhSeven).toHaveBeenCalled();
});
```

---

## Configuration Options
`new FeatherTest(options)`

### helpers
Files (or a directory of files) to load before your specs

### specs
The files (or a directory of files) that contain your specs

### beforeEach
A function to execute before each describe

### afterEach
A function to execute after each describe

### customMatchers
An array of matchers to add to the expect() return object
```js
customMatchers: [
    {
        name: 'toMatchCustom',
        message: 'to match custom things',
        matcher: function (expected, actual, utils) {
            return expected === actual * 3;
        }
    }
]
```

### stopAfterFirstFailure
If set to `true` specs will halt execution after the first spec fails

### timeout
How long (in ms) to wait for an async describe to call `done()`

## Build

We use Travis CI. Here's a link to the build: https://travis-ci.org/feather-test/feather-test
