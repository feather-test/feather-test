# feather-test

**Extremely lightweight test coverage**

*For when you know you need validation, but you don't want to configure a full-featured test suite*

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
featherTest.specs('./specs');

// run queued tests when this script is invoked
featherTest.run();
```

*myProject/test/specs/one.spec.js*
```js
describe('mogwai', function () {

    describe('when he gets wet', function () {

        describe('he becomes a gremlin', function () {
            expect(skin).not.toBe('furry');
            expect(temperament).toContain('angry');
            expect(explosions).toBe(7, 'explosions caused by gremlins');
        });

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

## Run
```
$ cd myProject
$ npm run test

// Results
// ------
// passed: 11
// failed: 0
//
// All tests passed!
```

## Spec Methods
*globally available within spec files*

- describe (can be nested)
- expect

## Available Matchers
*any of the below can be negated using not.matcher*

- toBe
- toContain

more coming soon...
