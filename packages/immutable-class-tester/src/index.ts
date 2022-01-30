/*
 * Copyright 2014-2015 Metamarkets Group Inc.
 * Copyright 2015-2019 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import deepEqual from 'deep-equal';
import hasOwnProp from 'has-own-prop';

export interface TesterOptions {
  newThrows?: boolean;
  context?: any;
}

const PROPERTY_KEYS: string[] = [
  'name',
  'defaultValue',
  'possibleValues',
  'validate',
  'immutableClass',
  'immutableClassArray',
  'immutableClassLookup',
  'equal',
  'toJS',
  'type',
  'contextTransform',
  'preserveUndefined',
  'emptyArrayIsOk',
];

/**
 * Checks it a given Class conforms to the Immutable Class guidelines by applying it to a given set of instances
 * @param ClassFn - The constructor function of the class to test
 * @param objects - An array of JS values to test on
 * @param options - Some testing options
 */
export function testImmutableClass<TypeJS>(
  ClassFn: any,
  objects: TypeJS[],
  options: TesterOptions = {},
) {
  if (typeof ClassFn !== 'function') throw new TypeError(`ClassFn must be a constructor function`);
  if (!Array.isArray(objects) || !objects.length) {
    throw new TypeError(`objects must be a non-empty array of js to test`);
  }
  const newThrows = options.newThrows;
  const context = options.context;

  // Check class name
  const className = ClassFn.name;
  if (className.length < 1) throw new Error(`Class must have a name of at least 1 letter`);
  const instanceName = className[0].toLowerCase() + className.substring(1);

  // Check static methods
  if (typeof ClassFn.fromJS !== 'function') throw new Error(`${className}.fromJS should exist`);

  // Check instance methods
  const instance = ClassFn.fromJS(objects[0], context);
  const objectProto = Object.prototype;
  if (instance.valueOf === objectProto.valueOf) {
    throw new Error(`Instance should implement valueOf`);
  }
  if (instance.toString === objectProto.toString) {
    throw new Error(`Instance should implement toString`);
  }
  if (typeof instance.toJS !== 'function') {
    throw new Error(`Instance should have a toJS function`);
  }
  if (typeof instance.toJSON !== 'function') {
    throw new Error(`Instance should have a toJSON function`);
  }
  if (typeof instance.equals !== 'function') {
    throw new Error(`Instance should have an equals function`);
  }

  // Check properties
  if (ClassFn.PROPERTIES) {
    // Only new style classes have these
    if (!Array.isArray(ClassFn.PROPERTIES)) {
      throw new Error('PROPERTIES should be an array');
    }
    ClassFn.PROPERTIES.forEach((property: any, i: number) => {
      if (typeof property.name !== 'string') {
        throw new Error(`Property ${i} is missing a name`);
      }
      Object.keys(property).forEach(key => {
        if (!PROPERTY_KEYS.includes(key)) {
          throw new Error(`PROPERTIES should include ${key}`);
        }
      });
    });
  }

  // Preserves
  for (let i = 0; i < objects.length; i++) {
    const where = `[in object ${i}]`;
    const objectJSON = JSON.stringify(objects[i]);
    const objectCopy1 = JSON.parse(objectJSON);
    const objectCopy2 = JSON.parse(objectJSON);

    const inst = ClassFn.fromJS(objectCopy1, context);
    if (!deepEqual(objectCopy1, objectCopy2)) {
      throw new Error(`${className}.fromJS function modified its input :-(`);
    }

    if (!(inst instanceof ClassFn)) {
      throw new Error(`${className}.fromJS did not return a ${className} instance ${where}`);
    }

    if (typeof inst.toString() !== 'string') {
      throw new Error(`${instanceName}.toString() must return a string ${where}`);
    }

    if (inst.equals(undefined) !== false) {
      throw new Error(`${instanceName}.equals(undefined) should be false ${where}`);
    }

    if (inst.equals(null as any) !== false) {
      throw new Error(`${instanceName}.equals(null) should be false ${where}`);
    }

    if (inst.equals([] as any) !== false) {
      throw new Error(`${instanceName}.equals([]) should be false ${where}`);
    }

    if (!deepEqual(inst.toJS(), objects[i])) {
      throw new Error(
        `${className}.fromJS(obj).toJS() was not a fixed point (did not deep equal obj) ${where}`,
      );
    }

    const instValueOf = inst.valueOf();
    if (inst.equals(instValueOf)) {
      throw new Error(`inst.equals(inst.valueOf()) ${where}`);
    }

    const instLazyCopy: any = {};
    for (const key in inst) {
      if (!hasOwnProp(inst, key)) continue;
      instLazyCopy[key] = inst[key];
    }

    if (inst.equals(instLazyCopy)) {
      throw new Error(`inst.equals(*an object with the same values*) ${where}`);
    }

    if (newThrows) {
      let badInst: any;
      let thrownError: Error | undefined;
      try {
        badInst = new ClassFn(instValueOf);
      } catch (e) {
        thrownError = e as Error;
      }
      if (!thrownError || badInst) {
        throw new Error(`new ${className} did not throw as indicated ${where}`);
      }
    } else {
      const instValueCopy = new ClassFn(instValueOf);
      if (!inst.equals(instValueCopy)) {
        throw new Error(`new ${className}().toJS() is not equal to the original ${where}`);
      }
      if (!deepEqual(instValueCopy.toJS(), inst.toJS())) {
        throw new Error(
          `new ${className}(${instanceName}.valueOf()).toJS() returned something bad ${where}`,
        );
      }
    }

    const instJSONCopy = ClassFn.fromJS(JSON.parse(JSON.stringify(inst)), context);
    if (!inst.equals(instJSONCopy)) {
      throw new Error(`JS Copy does not equal original ${where}`);
    }
    if (!deepEqual(instJSONCopy.toJS(), inst.toJS())) {
      throw new Error(
        `${className}.fromJS(JSON.parse(JSON.stringify(${instanceName}))).toJS() returned something bad ${where}`,
      );
    }
  }

  // Objects are equal only to themselves
  for (let j = 0; j < objects.length; j++) {
    const objectJ = ClassFn.fromJS(objects[j], context);
    for (let k = j; k < objects.length; k++) {
      const objectK = ClassFn.fromJS(objects[k], context);
      if (objectJ.equals(objectK) !== Boolean(j === k)) {
        throw new Error(`Equality of objects ${j} and ${k} was wrong`);
      }
    }
  }
}
