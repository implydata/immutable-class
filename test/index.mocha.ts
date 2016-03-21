/// <reference path="../typings/tsd.d.ts" />

import { expect } from "chai";

import { isInstanceOf, isArrayOf, isImmutableClass, immutableEqual, immutableArraysEqual, immutableLookupsEqual } from '../build/index';

class Animal {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class Koala extends Animal {
  public cutenessLevel() {
    return "TO_THE_MAX"
  }
}

function myExtend(d: any, b: any) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function Sup() { this.constructor = d; }
  Sup.prototype = b.prototype;
  d.prototype = new Sup();
}

class Person {
  static fromJS(name: string) {
    return new Person(name);
  }

  static isPerson(candidate) {
    return isInstanceOf(candidate, Person);
  }

  public name: string;

  constructor(name) {
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

  public equals(other) {
    return Person.isPerson(other) && this.name === other.name;
  }
}


describe("utils", () => {
  describe("isInstanceOf", () => {
    it("edge cases", () => {
      expect(isInstanceOf(null, Animal)).to.equal(false);
    });

    it("works within context", () => {
      var animal = new Animal("Garry");
      expect(isInstanceOf(animal, Animal)).to.equal(true);
      expect(isInstanceOf(animal, Koala)).to.equal(false);

      var koala = new Koala("Annie");
      expect(isInstanceOf(koala, Animal)).to.equal(true);
      expect(isInstanceOf(koala, Koala)).to.equal(true);
    });

    it("works with things form other contexts", () => {
      // Declare new identical classes, pretending that they came form different context.
      var Animal2 = (function () {
        function Animal(name: string): void {
          this.name = name;
        }
        return Animal;
      })();

      var Koala2 = (function (_super: any) {
        myExtend(Koala, _super);
        function Koala(name: string): void {
          _super.call(this, name);
        }
        Koala.prototype.cutenessLevel = function () {
          return "TO_THE_MAX";
        };
        return Koala;
      })(Animal2);

      // there to here
      var animal2 = new Animal2("Garry");
      expect(isInstanceOf(animal2, Animal)).to.equal(true);
      expect(isInstanceOf(animal2, Koala)).to.equal(false);

      var koala2 = new Koala2("Annie");
      expect(isInstanceOf(koala2, Animal)).to.equal(true);
      expect(isInstanceOf(koala2, Koala)).to.equal(true);

      // here to there
      var animal = new Animal("Garry");
      expect(isInstanceOf(animal, Animal2)).to.equal(true);
      expect(isInstanceOf(animal, Koala2)).to.equal(false);

      var koala = new Koala("Annie");
      expect(isInstanceOf(koala, Animal2)).to.equal(true);
      expect(isInstanceOf(koala, Koala2)).to.equal(true);
    })
  });

  describe("isArrayOf", () => {
    it("works", () => {
      expect(isArrayOf(null, Animal)).to.equal(false);
      expect(isArrayOf(<any>false, Animal)).to.equal(false);
      expect(isArrayOf(<any>"blah", Animal)).to.equal(false);
      expect(isArrayOf(["kitchen"], Animal)).to.equal(false);

      expect(isArrayOf([[], [1], [1, 2]], Array)).to.equal(true);

      expect(
        isArrayOf([
          new Animal("Tom"),
          new Animal("Jerry"),
          new Koala("Annie")
        ], Animal)
      ).to.equal(true);
    })
  });

  describe("isImmutableClass", () => {
    it("works", () => {
      expect(isImmutableClass(null)).to.equal(false);
      expect(isImmutableClass(false)).to.equal(false);
      expect(isImmutableClass([])).to.equal(false);
      expect(isImmutableClass(Animal)).to.equal(false);

      expect(isImmutableClass(new Person('Bob')), "Person is a Immutable Class").to.equal(true);
    });

  });


  describe("immutableEqual", () => {
    it("works", () => {
      var tom = new Person('Tom');
      var bob1 = new Person('Bob');
      var bob2 = new Person('Bob');

      expect(immutableEqual(null, null)).to.equal(true);

      expect(immutableEqual(tom, null)).to.equal(false);
      expect(immutableEqual(null, tom)).to.equal(false);
      expect(immutableEqual(tom, bob1)).to.equal(false);

      expect(immutableEqual(bob1, bob2)).to.equal(true);
    });

  });


  describe("immutableArraysEqual", () => {
    it("works", () => {
      var tom = new Person('Tom');
      var bob1 = new Person('Bob');
      var bob2 = new Person('Bob');

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
      var tom = new Person('Tom');
      var bob1 = new Person('Bob');
      var bob2 = new Person('Bob');

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
