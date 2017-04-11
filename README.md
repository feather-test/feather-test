# feather-test

**Extremely lightweight JavaScript test coverage for Node and Browser**

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

## Run Your Tests in Node.js
*myProject/test/run.js*
```js
var FeatherTest = require('feather-test');

// create a new FeatherTest with your spec files
var myTests = new FeatherTest({
    helpers: './helpers',
    specs: './specs'
});

// run all queued tests by calling `run`
// (can pass an optional callback to be executed after tests finish)
myTests.run(callback);
```

```
$ cd myProject
$ npm test

// All 4 tests passed!
```

## Run Your Tests in a Browser
*myProject/test/run.js*
```js
var FeatherTest = require('feather-test');

// create a new FeatherTest with your spec files
var myTests = new FeatherTest({
    helpers: './helpers',
    specs: './specs'
});

// run all queued tests by calling `run`
myTests.browser();
```

```
$ cd myProject
$ npm test

// You will be given a URL that you can open in any browser on your machine
```

## Spec Methods
*globally available within spec files*

- describe (can be nested)
- xdescribe (skips this block and all assertions contained within)
- it (same as describe, but added to make migrations easier)

## Available Matchers
*any of the below can also be negated using not.toBe, etc.*

- toBe
- toBeGreaterThan
- toBeLessThan
- toContain
- toEqual

## Mocks
Any required module can be mocked. [Learn how to mock modules](https://github.com/seebigs/feather-test/wiki/How-to-mock-modules)
