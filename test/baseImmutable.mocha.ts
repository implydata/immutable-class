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

/// <reference path="../typings/tsd.d.ts" />

import { expect } from "chai";

import { isInstanceOf, BaseImmutable } from '../build/index';


interface CarValue {
  name: string;
  fuel: string;
  subCar: Car;
}

interface CarJS {
  name: string;
  fuel?: string;
  subCar?: CarJS;
}

class Car extends BaseImmutable<CarValue, CarJS> {
  static PROPERTIES = [
    {
      name: 'name',
      validate: (n) => {
        if (n.toLowerCase() !== n) throw new Error('must be lowercase');
      }
    },
    {
      name: 'fuel',
      defaultValue: 'electric'
    },
    {
      name: 'subCar',
      immutableClass: Car
    }
  ];

  static isCar(car) {
    return isInstanceOf(car, Car);
  }

  static fromJS(properties: CarJS) {
    return new Car(BaseImmutable.jsToValue(Car.PROPERTIES, properties));
  }


  public name: string;
  public fuel: string;
  public subCar: Car;

  public changeFuel: (fuel: string) => this;
  public getFuel: () => string;

  constructor(properties: CarValue) {
    super(properties);
  }
}
BaseImmutable.finalize(Car);


describe("BaseImmutable", () => {

  it("works with basics", () => {
    var car = Car.fromJS({ name: 'ford', fuel: 'electric' });

    expect(car.get('name')).to.equal('ford');
    expect(car.get('fuel')).to.equal('electric');

    car = car.change('fuel', 'gas');
    expect(car.get('fuel')).to.equal('gas');

    car = car.changeFuel('diesel');
    expect(car.getFuel()).to.equal('diesel');
  });

  it("works with errors", () => {
    expect(() => {
      Car.fromJS({ name: 'Ford', fuel: 'electric' })
    }).to.throw('Car.name must be lowercase');
  });

});
