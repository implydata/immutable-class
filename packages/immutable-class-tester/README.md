# Immutable Class Tester

A little library to facilitate the testing of [immutable classes](https://github.com/implydata/immutable-class).

This library is really just a set of templates and testing tools to allow for quick construction of immutable classes.

Immutable Class provides one testing function for testing potential immutable classes: `testImmutableClass`

It is used like so:

```javascript
testImmutableClass(MyImmutableClassConstructor, [
  { "potential": 1 }
  { "distinct": 2 }
  { "js": 3 }
  { "immutable classes": 4 }
]);
```

This function will then try to call `fromJS` on each candidate and run it through a series of tests to ensure that it
corresponds to the rules above. It will also do an equality check of every object with every other object and make sure
that it only equals itself.

For an example of the usage of this library look at these files: [source](https://github.com/implyio/chronoshift/blob/master/src/duration.ts), [tests](https://github.com/implyio/chronoshift/blob/master/test/duration.mocha.ts).
