/*
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

import {
  generalEqual,
  immutableArraysEqual,
  immutableEqual,
  immutableLookupsEqual,
} from './equality';

class Person {
  static fromJS(name: string) {
    return new Person(name);
  }

  static isPerson(candidate: Person) {
    return candidate instanceof Person;
  }

  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  public toString() {
    return this.name;
  }

  public valueOf() {
    return this.name;
  }

  public toJS() {
    return this.name;
  }

  public toJSON() {
    return this.name;
  }

  public equals(other: Person) {
    return Person.isPerson(other) && this.name === other.name;
  }
}

describe('equality', () => {
  describe('generalEqual', () => {
    it('works with basics (strings)', () => {
      const tom = 'Tom';
      const bob1 = 'Bob';
      const bob2 = 'Bob';

      expect(generalEqual(null, null)).toEqual(true);

      expect(generalEqual(tom, null)).toEqual(false);
      expect(generalEqual(null, tom)).toEqual(false);
      expect(generalEqual(tom, bob1)).toEqual(false);

      expect(generalEqual(bob1, bob2)).toEqual(true);
    });

    it('works with basics (Dates)', () => {
      const tom = new Date('2016');
      const bob1 = new Date('2015');
      const bob2 = new Date('2015');

      expect(generalEqual(null, null)).toEqual(true);

      expect(generalEqual(tom, null)).toEqual(false);
      expect(generalEqual(null, tom)).toEqual(false);
      expect(generalEqual(tom, bob1)).toEqual(false);

      expect(generalEqual(bob1, bob2)).toEqual(true);
    });

    it('works with immutables', () => {
      const tom = new Person('Tom');
      const bob1 = new Person('Bob');
      const bob2 = new Person('Bob');

      expect(generalEqual(null, null)).toEqual(true);

      expect(generalEqual(tom, null)).toEqual(false);
      expect(generalEqual(null, tom)).toEqual(false);
      expect(generalEqual(tom, bob1)).toEqual(false);

      expect(generalEqual(bob1, bob2)).toEqual(true);
    });
  });

  describe('immutableEqual', () => {
    it('works immutables', () => {
      const tom = new Person('Tom');
      const bob1 = new Person('Bob');
      const bob2 = new Person('Bob');

      expect(immutableEqual(undefined, undefined)).toEqual(true);

      expect(immutableEqual(tom, undefined)).toEqual(false);
      expect(immutableEqual(undefined, tom)).toEqual(false);
      expect(immutableEqual(tom, bob1)).toEqual(false);

      expect(immutableEqual(bob1, bob2)).toEqual(true);
    });
  });

  describe('immutableArraysEqual', () => {
    it('works', () => {
      const tom = new Person('Tom');
      const bob1 = new Person('Bob');
      const bob2 = new Person('Bob');

      expect(immutableArraysEqual(undefined, undefined)).toEqual(true);

      expect(immutableArraysEqual([], undefined)).toEqual(false);
      expect(immutableArraysEqual([tom], undefined)).toEqual(false);
      expect(immutableArraysEqual(undefined, [])).toEqual(false);
      expect(immutableArraysEqual(undefined, [tom])).toEqual(false);
      expect(immutableArraysEqual([tom], [])).toEqual(false);
      expect(immutableArraysEqual([tom], [bob1])).toEqual(false);

      expect(immutableArraysEqual([], [])).toEqual(true);
      expect(immutableArraysEqual([bob1], [bob2])).toEqual(true);
      expect(immutableArraysEqual([bob1, tom], [bob2, tom])).toEqual(true);
    });
  });

  describe('immutableLookupsEqual', () => {
    it('works', () => {
      const tom = new Person('Tom');
      const bob1 = new Person('Bob');
      const bob2 = new Person('Bob');

      expect(immutableLookupsEqual(undefined, undefined)).toEqual(true);

      expect(immutableLookupsEqual({}, undefined)).toEqual(false);
      expect(immutableLookupsEqual({ a: tom }, undefined)).toEqual(false);
      expect(immutableLookupsEqual(undefined, {})).toEqual(false);
      expect(immutableLookupsEqual(undefined, { a: tom })).toEqual(false);
      expect(immutableLookupsEqual({ a: tom }, {})).toEqual(false);
      expect(immutableLookupsEqual({ a: tom }, { a: bob1 })).toEqual(false);

      expect(immutableLookupsEqual({}, {})).toEqual(true);
      expect(immutableLookupsEqual({ a: bob1 }, { a: bob2 })).toEqual(true);
      expect(immutableLookupsEqual({ a: bob1, b: tom }, { a: bob2, b: tom })).toEqual(true);
    });
  });
});
