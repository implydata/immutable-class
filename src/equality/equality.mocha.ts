/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { expect } from "chai";

import { generalEqual, immutableEqual, immutableArraysEqual, immutableLookupsEqual } from './equality';

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


describe("equality", () => {
  describe("generalEqual", () => {
    it("works with basics (strings)", () => {
      let tom = 'Tom';
      let bob1 = 'Bob';
      let bob2 = 'Bob';

      expect(generalEqual(null, null)).to.equal(true);

      expect(generalEqual(tom, null)).to.equal(false);
      expect(generalEqual(null, tom)).to.equal(false);
      expect(generalEqual(tom, bob1)).to.equal(false);

      expect(generalEqual(bob1, bob2)).to.equal(true);
    });

    it("works with basics (Dates)", () => {
      let tom = new Date('2016');
      let bob1 = new Date('2015');
      let bob2 = new Date('2015');

      expect(generalEqual(null, null)).to.equal(true);

      expect(generalEqual(tom, null)).to.equal(false);
      expect(generalEqual(null, tom)).to.equal(false);
      expect(generalEqual(tom, bob1)).to.equal(false);

      expect(generalEqual(bob1, bob2)).to.equal(true);
    });

    it("works immutables", () => {
      let tom = new Person('Tom');
      let bob1 = new Person('Bob');
      let bob2 = new Person('Bob');

      expect(generalEqual(null, null)).to.equal(true);

      expect(generalEqual(tom, null)).to.equal(false);
      expect(generalEqual(null, tom)).to.equal(false);
      expect(generalEqual(tom, bob1)).to.equal(false);

      expect(generalEqual(bob1, bob2)).to.equal(true);
    });

  });


  describe("immutableEqual", () => {
    it("works immutables", () => {
      let tom = new Person('Tom');
      let bob1 = new Person('Bob');
      let bob2 = new Person('Bob');

      expect(immutableEqual(null, null)).to.equal(true);

      expect(immutableEqual(tom, null)).to.equal(false);
      expect(immutableEqual(null, tom)).to.equal(false);
      expect(immutableEqual(tom, bob1)).to.equal(false);

      expect(immutableEqual(bob1, bob2)).to.equal(true);
    });

  });


  describe("immutableArraysEqual", () => {
    it("works", () => {
      let tom = new Person('Tom');
      let bob1 = new Person('Bob');
      let bob2 = new Person('Bob');

      expect(immutableArraysEqual(null, null)).to.equal(true);

      expect(immutableArraysEqual([], null)).to.equal(false);
      expect(immutableArraysEqual([tom], null)).to.equal(false);
      expect(immutableArraysEqual(null, [])).to.equal(false);
      expect(immutableArraysEqual(null, [tom])).to.equal(false);
      expect(immutableArraysEqual([tom], [])).to.equal(false);
      expect(immutableArraysEqual([tom], [bob1])).to.equal(false);
      expect(immutableArraysEqual([bob1, null], [bob1, tom])).to.equal(false);
      expect(immutableArraysEqual([bob1, tom], [bob1, null])).to.equal(false);

      expect(immutableArraysEqual([], [])).to.equal(true);
      expect(immutableArraysEqual([bob1], [bob2])).to.equal(true);
      expect(immutableArraysEqual([bob1, tom], [bob2, tom])).to.equal(true);
    });

  });


  describe("immutableLookupsEqual", () => {
    it("works", () => {
      let tom = new Person('Tom');
      let bob1 = new Person('Bob');
      let bob2 = new Person('Bob');

      expect(immutableLookupsEqual(null, null)).to.equal(true);

      expect(immutableLookupsEqual({}, null)).to.equal(false);
      expect(immutableLookupsEqual({ a: tom }, null)).to.equal(false);
      expect(immutableLookupsEqual(null, {})).to.equal(false);
      expect(immutableLookupsEqual(null, { a: tom })).to.equal(false);
      expect(immutableLookupsEqual({ a: tom }, {})).to.equal(false);
      expect(immutableLookupsEqual({ a: tom }, { a: bob1 })).to.equal(false);
      expect(immutableLookupsEqual({ a: bob1, b: null }, { a: bob1, b: tom })).to.equal(false);
      expect(immutableLookupsEqual({ a: bob1, b: tom }, { a: bob1, b: null })).to.equal(false);

      expect(immutableLookupsEqual({}, {})).to.equal(true);
      expect(immutableLookupsEqual({ a: bob1 }, { a: bob2 })).to.equal(true);
      expect(immutableLookupsEqual({ a: bob1, b: tom }, { a: bob2, b: tom })).to.equal(true);
    });

  });

});
