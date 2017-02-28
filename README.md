# feather-test

**Extremely lightweight test coverage**

*Refactor safely -- without configuring a heavy test suite*

## Install
```
$ npm install feather-test --save-dev
```

## Setup
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

*myProject/test/run.js*
```js
var featherTest = require('feather-test');

// point to the directory that contains your spec files
// queues tests that are defined within
featherTest.queue('./specs');

// run all queued tests by calling `run`
// (can pass an optional callback to be executed after tests finish)
featherTest.run(callback);
```

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

## Run Your Tests
```
$ cd myProject
$ npm test

// All 4 tests passed!
```

## Spec Methods
*globally available within spec files*

- describe (can be nested)
- xdescribe (skips this block and all assertions contained within)

## Available Matchers
*any of the below can also be negated using not.toBe, etc.*

- toBe
- toBeGreaterThan
- toBeLessThan
- toContain
- toEqual

## Mocks
Any required module can be mocked. [Learn how to mock modules](https://github.com/seebigs/feather-test/wiki/How-to-mock-modules)
