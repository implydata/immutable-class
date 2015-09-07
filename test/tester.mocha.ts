/// <reference path="../typings/tsd.d.ts" />

import chai = require("chai");
import expect = chai.expect;

import { isInstanceOf } from '../build/index';
import { testImmutableClass } from '../build/tester';

class Animal {
  static fromJS(name: string) {
    // Removes hashtags
    name = name.replace(/^#/, '');
    return new Animal(name);
  }

  static isAnimal(animal) {
    return isInstanceOf(animal, Animal);
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
    return Animal.isAnimal(other) && this.name === other.name;
  }
}

class AnimalNoFromJS {
  static isAnimalNoFromJS(animal) {
    return isInstanceOf(animal, AnimalNoFromJS);
  }

  public name: string;

  constructor(name) {
    this.name = name;
  }
}


class AnimalBadToJS {
  static fromJS(name) {
    return new AnimalBadToJS(name);
  }

  static isAnimalBadToJS(animal) {
    return isInstanceOf(animal, AnimalBadToJS);
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
    return 'Bad ' + this.name;
  }

  public toJSON() {
    return this.name;
  }

  public equals(other) {
    return AnimalBadToJS.isAnimalBadToJS(other) && this.name === other.name;
  }
}

class AnimalWithContext {
  static fromJS(name, animalWeights) {
    var w: number = animalWeights[name];
    if (!w) throw new Error("unknown animal (it has no weight)");
    return new AnimalWithContext({
      n: name,
      w: w
    });
  }

  static isAnimalWithContext(animal) {
    return isInstanceOf(animal, AnimalWithContext);
  }

  public name: string;
  public weight: number;

  constructor(p: any) {
    this.name = p.n;
    this.weight = p.w;
  }

  public toString() {
    return this.name;
  }

  public valueOf() {
    return { n: this.name }
  }

  public toJS() {
    return this.name;
  }

  public toJSON() {
    return this.name;
  }

  public equals(other) {
    return AnimalWithContext.isAnimalWithContext(other) && this.name === other.name;
  }
}


describe("testImmutableClass", () => {
  it("works for Animal class", () => {
    testImmutableClass(Animal, [
      "Koala",
      "Snake",
      "Dog",
      "Cat"
    ])
  });

  it("fails when given non fixed point js", () => {
    expect(() => {
      testImmutableClass(Animal, [
        "Koala",
        "Snake",
        "Dog",
        "#Cat"
      ])
    }).to.throw(Error, "Animal.fromJS(obj).toJS() was not a fixed point (did not deep equal obj) [in object 3]: expected 'Cat' to deeply equal '#Cat'")
  });

  it("rejects AnimalNoFromJS class", () => {
    expect(() => {
      testImmutableClass(AnimalNoFromJS, [
        "Koala",
        "Snake",
        "Dog"
      ])
    }).to.throw(Error, 'AnimalNoFromJS.fromJS should exist: expected undefined to be a function')
  });

  it("rejects AnimalBadToJS class", () => {
    expect(() => {
      testImmutableClass(AnimalBadToJS, [
        "Koala",
        "Snake",
        "Dog"
      ])
    }).to.throw(Error, "AnimalBadToJS.fromJS(obj).toJS() was not a fixed point (did not deep equal obj) [in object 0]: expected 'Bad Koala' to deeply equal 'Koala'")
  });

  it("works for AnimalWithContext class (with context)", () => {
    var animalWeights = {
      "Koala": 5,
      "Snake": 4,
      "Dog": 12
    };
    testImmutableClass(AnimalWithContext, [
      "Koala",
      "Snake",
      "Dog"
    ], {
      context: animalWeights
    })
  });
});
