# Immutable Class

A little library to facilitate creating and testing serializable, immutable classes.

This library is really just a set of templates and testing tools to allow for quick construction of immutable classes.

## Templates

An object `Blah` is considered a immutable class of it meats the following criteria:

- It is a JS 'class' that starts with an uppercase letter
- It has a static `Blah.isBlah` method for checking if something is an instance of the given class
- It has a static `Blah.fromJS` method for deserializing classes
- It has an instance `blah.valueOf` method that return a minimally serialized object (preserving all sub classes as immutable classes)
- It has an instance `blah.toJS` method that return a fully serialized object (recursively serializing all sub classes)
- It has an instance `blah.toJSON` method that returns the same as the toJS method allowing the object to be passed into `JSON.stringify`
- It has an instance `blah.toString` method that is implemented in some way (and returns a `string`)
- It has an instance `blah.equals` method that can be used to compare this object to other classes to check for equivalence.

## Testing tools

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
