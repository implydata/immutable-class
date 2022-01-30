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

import { testImmutableClass } from './index';

class Animal {
  static fromJS(name: string) {
    // Removes hashtags
    name = name.replace(/^#/, '');
    return new Animal(name);
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

  public equals(other: Animal | undefined) {
    return other instanceof Animal && this.name === other.name;
  }
}

class AnimalNoFromJS {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class AnimalBadToJS {
  static fromJS(name: string) {
    return new AnimalBadToJS(name);
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
    return 'Bad ' + this.name;
  }

  public toJSON() {
    return this.name;
  }

  public equals(other: AnimalBadToJS) {
    return other instanceof AnimalBadToJS && this.name === other.name;
  }
}

class AnimalWithContext {
  static fromJS(name: string, animalWeights: any) {
    const w: number = animalWeights[name];
    if (!w) throw new Error('unknown animal (it has no weight)');
    return new AnimalWithContext({
      n: name,
      w: w,
    });
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
    return { n: this.name };
  }

  public toJS() {
    return this.name;
  }

  public toJSON() {
    return this.name;
  }

  public equals(other: AnimalWithContext) {
    return other instanceof AnimalWithContext && this.name === other.name;
  }
}

describe('testImmutableClass', () => {
  it('works for Animal class', () => {
    testImmutableClass(Animal, ['Koala', 'Snake', 'Dog', 'Cat']);
  });

  it('fails when given non fixed point js', () => {
    expect(() => {
      testImmutableClass(Animal, ['Koala', 'Snake', 'Dog', '#Cat']);
    }).toThrowError();
  });

  it('rejects AnimalNoFromJS class', () => {
    expect(() => {
      testImmutableClass(AnimalNoFromJS, ['Koala', 'Snake', 'Dog']);
    }).toThrowError();
  });

  it('rejects AnimalBadToJS class', () => {
    expect(() => {
      testImmutableClass(AnimalBadToJS, ['Koala', 'Snake', 'Dog']);
    }).toThrowError();
  });

  it('works for AnimalWithContext class (with context)', () => {
    const animalWeights = {
      Koala: 5,
      Snake: 4,
      Dog: 12,
    };
    testImmutableClass(AnimalWithContext, ['Koala', 'Snake', 'Dog'], {
      context: animalWeights,
    });
  });
});
