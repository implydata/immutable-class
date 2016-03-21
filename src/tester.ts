import { expect } from "chai";

export interface TesterOptions {
  newThrows?: boolean;
  context?: any;
}

/**
 * Checks it a given Class conforms to the Immutable Class guidelines by applying it to a given set of instances
 * @param ClassFn - The constructor function of the class to test
 * @param objects - An array of JS values to test on
 * @param options - Some testing options
 */
export function testImmutableClass<TypeJS>(ClassFn: any, objects: TypeJS[], options: TesterOptions = {}) {
  if (typeof ClassFn !== 'function') throw new TypeError("ClassFn must be a constructor function");
  if (!Array.isArray(objects) || !objects.length) {
    throw new TypeError("objects must be a non-empty array of js to test");
  }
  var newThrows = options.newThrows;
  var context = options.context;

  // Check class name
  var className = ClassFn.name;
  if (className.length <= 1) throw new Error("Class must have a name longer than 1 letter");
  if (className[0] !== className[0].toUpperCase()) throw new Error("Class name must start with a capital letter");
  var instanceName = className[0].toLowerCase() + className.substring(1);

  // Check static methods
  expect(ClassFn.fromJS, className + ".fromJS should exist").to.be.a('function');
  expect(ClassFn['is' + className], className + ".is" + className + " should exist").to.be.a('function');

  // Check instance methods
  var instance = ClassFn.fromJS(objects[0], context);
  var objectProto = Object.prototype;
  expect(instance.valueOf, "Instance should implement valueOf").to.not.equal(objectProto.valueOf);
  expect(instance.toString, "Instance should implement toString").to.not.equal(objectProto.toString);
  expect(instance.toJS, "Instance should have a toJS function").to.be.a('function');
  expect(instance.toJSON, "Instance should have a toJSON function").to.be.a('function');
  expect(instance.equals, "Instance should have an equals function").to.be.a('function');

  // Check isClass
  var isClass: Function = ClassFn['is' + className];
  expect(isClass(null), "is" + className + " should fail on null").to.equal(false);
  expect(isClass([]), "is" + className + " should fail on []").to.equal(false);
  expect(isClass(''), "is" + className + " should fail on ''").to.equal(false);

  // Preserves
  for (var i = 0; i < objects.length; i++) {
    var where = " [in object " + i + "]";
    var objectJSON = JSON.stringify(objects[i]);
    var objectCopy1 = JSON.parse(objectJSON);
    var objectCopy2 = JSON.parse(objectJSON);

    var inst = ClassFn.fromJS(objectCopy1, context);
    expect(objectCopy1, className + ".fromJS function modified its input :-(").to.deep.equal(objectCopy2);

    expect(
      inst,
      className + ".fromJS did not return a " + className + " instance" + where
    ).to.be.instanceOf(ClassFn);

    expect(
      isClass(inst),
      "is" + className + ".is" + className + " failed on something created with toJS" + where
    ).to.equal(true);

    expect(
      inst.toString(),
      instanceName + ".toString() must return a string" + where
    ).to.be.a('string');

    expect(
      inst.equals(null),
      instanceName + ".equals(null) should be false" + where
    ).to.equal(false);

    expect(
      inst.equals([]),
      instanceName + ".equals([]) should be false" + where
    ).to.equal(false);

    expect(
      inst.toJS(),
      className + ".fromJS(obj).toJS() was not a fixed point (did not deep equal obj)" + where
    ).to.deep.equal(objects[i]);

    var instValueOf = inst.valueOf();
    expect(
      inst.equals(instValueOf),
      "inst.equals(inst.valueOf())" + where
    ).to.equal(false);

    var instLazyCopy: any = {};
    for (var key in inst) {
      if (!inst.hasOwnProperty(key)) continue;
      instLazyCopy[key] = inst[key];
    }

    expect(
      inst.equals(instLazyCopy),
      "inst.equals(*an object with the same values*)" + where
    ).to.equal(false);

    if (newThrows) {
      expect(() => {
        new ClassFn(instValueOf);
      }, "new " + className + " did not throw as indicated" + where).to.throw(Error)
    } else {
      var instValueCopy = new ClassFn(instValueOf);
      expect(
        inst.equals(instValueCopy),
        "new " + className + "().toJS() is not equal to the original" + where
      ).to.equal(true);
      expect(
        instValueCopy.toJS(),
        "new " + className + "(" + instanceName + ".valueOf()).toJS() returned something bad" + where
      ).to.deep.equal(inst.toJS());
    }

    var instJSONCopy = ClassFn.fromJS(JSON.parse(JSON.stringify(inst)), context);
    expect(inst.equals(instJSONCopy), "JS Copy does not equal original" + where).to.equal(true);
    expect(
      instJSONCopy.toJS(),
      className + ".fromJS(JSON.parse(JSON.stringify(" + instanceName + "))).toJS() returned something bad" + where
    ).to.deep.equal(inst.toJS());
  }

  // Objects are equal only to themselves
  for (var j = 0; j < objects.length; j++) {
    var objectJ = ClassFn.fromJS(objects[j], context);
    for (var k = j; k < objects.length; k++) {
      var objectK = ClassFn.fromJS(objects[k], context);
      expect(
        objectJ.equals(objectK),
        "Equality of objects " + j + " and " + k + " was wrong"
      ).to.equal(j === k);
    }
  }
}
