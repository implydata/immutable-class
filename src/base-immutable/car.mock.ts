/*
 * Copyright 2019 Imply Data, Inc.
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

import { BackCompat, BaseImmutable, Property, PropertyType } from './base-immutable';

export interface DriverValue {
  name: string;
}

export interface DriverJS {
  name: string;
}

export class Driver extends BaseImmutable<DriverValue, DriverJS> {
  static POPE: Driver;

  static PROPERTIES: Property[] = [{ name: 'name', defaultValue: null }];

  static fromJS(params: DriverValue) {
    return new Driver(BaseImmutable.jsToValue(Driver.PROPERTIES, params));
  }

  constructor(params: DriverValue) {
    super(params);
  }
}
BaseImmutable.finalize(Driver);
Driver.POPE = Driver.fromJS({ name: 'the pope' });

export interface CarValue {
  name: string;
  fuel: string;
  subCar: Car;
  range?: number;
  relatedCars?: Car[];
  createdOn?: Date;
  owners?: string[];
  driver?: Driver;
}

export interface CarJS {
  name: string;
  fuel?: string;
  subCar?: CarJS;
  range?: number;
  relatedCars?: CarJS[];
  createdOn?: Date | string;
  owners?: string[];
  driver?: DriverJS;
}

function ensureNonNegative(n: any): void {
  if (n < 0) throw new Error('must non negative positive');
}

export class Car extends BaseImmutable<CarValue, CarJS> {
  static PROPERTIES: Property[] = [
    {
      name: 'name',
      validate: (n: string) => {
        if (n.toLowerCase() !== n) throw new Error('must be lowercase');
      },
    },
    {
      name: 'fuel',
      defaultValue: 'electric',
      possibleValues: ['gas', 'diesel', 'electric'],
    },
    {
      name: 'subCar',
      defaultValue: null,
      immutableClass: Car,
    },
    {
      name: 'range',
      defaultValue: 100,
      validate: [BaseImmutable.ensure.number, ensureNonNegative],
    },
    {
      name: 'relatedCars',
      defaultValue: [],
      immutableClassArray: Car,
    },
    {
      name: 'createdOn',
      defaultValue: null,
      type: PropertyType.DATE,
    },
    {
      name: 'owners',
      defaultValue: null,
      emptyArrayIsOk: true,
    },
    {
      name: 'driver',
      defaultValue: Driver.POPE,
      immutableClass: Driver,
    },
  ];

  static BACK_COMPATS: BackCompat[] = [
    {
      condition: (js: any) => {
        return js.fuelType;
      },
      action: (js: any) => {
        js.fuel = js.fuelType;
      },
    },
  ];

  static isCar(car: Car) {
    return car instanceof Car;
  }

  static fromJS(properties: CarJS) {
    return new Car(BaseImmutable.jsToValue(Car.PROPERTIES, properties, Car.BACK_COMPATS));
  }

  public name!: string;
  public fuel!: string;
  public subCar!: Car;
  public range!: number;
  public createdOn!: Date;

  constructor(properties: CarValue) {
    super(properties);
  }

  public changeFuel!: (fuel: string) => this;
  public getFuel!: () => string;

  public getRange!: () => number;
  public getName!: () => string;
  public getRelatedCars!: () => Car[];

  public getSubCar() {
    const { name, subCar } = this;
    if (subCar) return subCar;
    if (name === 'ford') return Car.fromJS({ name: 'pinto', fuel: 'gas' });
    if (name === 'toyota') return Car.fromJS({ name: 'prius', fuel: 'electric' });
    return null;
  }

  public changeRange(n: number) {
    const value = this.valueOf();
    const { fuel } = value;
    if (fuel === 'electric') {
      value.range = n > 400 ? 400 : n;
      return new Car(value);
    }
    if (fuel === 'diesel') {
      value.range = n > 2000 ? 2000 : n;
      return new Car(value);
    }

    value.range = n;
    return new Car(value);
  }
}
BaseImmutable.finalize(Car);
