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

import { BaseImmutable, Property } from './base-immutable';


interface CarValue {
  name: string;
  fuel: string;
  subCar: Car;
  range?: number;
}

interface CarJS {
  name: string;
  fuel?: string;
  subCar?: CarJS;
  range?: number;
}

function ensureNonNegative(n: any): void {
  if (n < 0) throw new Error('must non negative positive');
}

class Car extends BaseImmutable<CarValue, CarJS> {
  static PROPERTIES: Property[] = [
    {
      name: 'name',
      validate: (n: string) => {
        if (n.toLowerCase() !== n) throw new Error('must be lowercase');
      }
    },
    {
      name: 'fuel',
      defaultValue: 'electric',
      possibleValues: ['gas', 'diesel', 'electric']
    },
    {
      name: 'subCar',
      defaultValue: null,
      immutableClass: Car
    },
    {
      name: 'range',
      defaultValue: 100,
      validate: [BaseImmutable.ensure.number, ensureNonNegative]
    }
  ];

  static isCar(car: Car) {
    return car instanceof Car;
  }

  static fromJS(properties: CarJS) {
    return new Car(BaseImmutable.jsToValue(Car.PROPERTIES, properties));
  }


  public name: string;
  public fuel: string;
  public subCar: Car;
  public range: number;

  constructor(properties: CarValue) {
    super(properties);
  }

  public changeFuel: (fuel: string) => this;
  public getFuel: () => string;

  public changeRange: (range: number) => this;
  public getRange: () => number;
}
BaseImmutable.finalize(Car);


describe("BaseImmutable", () => {

  it("works with basics", () => {
    var car = Car.fromJS({ name: 'ford', fuel: 'electric' });

    expect(car.get('name')).to.equal('ford');
    expect(car.get('fuel')).to.equal('electric');
    expect(car.getRange()).to.equal(100);

    car = car.change('fuel', 'gas');
    expect(car.get('fuel')).to.equal('gas');

    car = car.changeFuel('diesel');
    expect(car.getFuel()).to.equal('diesel');

    car = car.changeRange(0);
    expect(car.getRange()).to.equal(0);
  });

  it("works with errors", () => {
    expect(() => {
      Car.fromJS({ fuel: 'electric' } as any)
    }).to.throw('Car.name must be defined');

    expect(() => {
      Car.fromJS({ name: 'Ford', fuel: 'electric' })
    }).to.throw('Car.name must be lowercase');

    expect(() => {
      Car.fromJS({ name: 'ford', fuel: 'farts' })
    }).to.throw("Car.fuel can not have value 'farts' must be one of [gas, diesel, electric]");

    expect(() => {
      Car.fromJS({ name: 'ford', fuel: 'electric', range: ('lol' as any) })
    }).to.throw("Car.range must be a number");

    expect(() => {
      Car.fromJS({ name: 'ford', fuel: 'electric', range: -3 })
    }).to.throw("Car.range must non negative positive");
  });

});
