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

import { Car } from './car.mock';

describe('BaseImmutable', () => {
  it('works with basics', () => {
    let car = Car.fromJS({ name: 'ford', fuel: 'electric' });

    expect(car.get('name')).toEqual('ford');
    expect(car.get('fuel')).toEqual('electric');
    expect(car.getRange()).toEqual(100);

    car = car.change('fuel', 'gas');
    expect(car.get('fuel')).toEqual('gas');

    car = car.changeFuel('diesel');
    expect(car.getFuel()).toEqual('diesel');

    car = car.changeRange(0);
    expect(car.getRange()).toEqual(0);
    expect(car.toJS()).toEqual({
      fuel: 'diesel',
      name: 'ford',
      range: 0,
    });

    expect(car.getRelatedCars()).toEqual([]);

    const car2 = Car.fromJS(car.toJS());
    expect(car2.equals(car)).toEqual(true);
    expect(car2.toJS()).toEqual(car.toJS());
  });

  it('calling general getter calls defined getter', () => {
    const ford = Car.fromJS({ name: 'ford' });
    expect(ford.get('subCar').getName()).toEqual('pinto');
    expect(ford.getSubCar()!.getName()).toEqual('pinto');

    const toyota = Car.fromJS({ name: 'toyota' });
    expect(toyota.get('subCar').getName()).toEqual('prius');
    expect(toyota.getSubCar()!.getName()).toEqual('prius');
  });

  it('calling general changer calls defined changer', () => {
    const leaf = Car.fromJS({ name: 'leaf', fuel: 'electric' });
    expect(leaf.change('range', 900).getRange()).toEqual(400);
    expect(leaf.changeRange(900).getRange()).toEqual(400);

    const truck = Car.fromJS({ name: 'truck', fuel: 'diesel' });
    expect(truck.change('range', 900).getRange()).toEqual(900);
    expect(truck.changeRange(900).getRange()).toEqual(900);
  });

  it('works with changeMany', () => {
    let leaf = Car.fromJS({ name: 'leaf', fuel: 'electric' });

    leaf = leaf.changeMany({
      fuel: 'diesel',
      name: 'ford',
      range: 900,
    });

    expect(leaf.getFuel()).toEqual('diesel');
    expect(leaf.getName()).toEqual('ford');
    expect(leaf.getRange()).toEqual(900);
  });

  describe('getDifference', () => {
    const car0 = Car.fromJS({ name: 'poet' });

    it('no other', () => {
      expect(car0.getDifference(undefined)).toEqual(['__no_other__']);
    });

    it('single diff', () => {
      const car1 = Car.fromJS({ name: 'artist' });
      expect(car0.getDifference(car1)).toEqual(['name']);
    });

    it('multi diff (multi)', () => {
      const car1 = Car.fromJS({ name: 'artist', fuel: 'electric' });
      expect(car0.getDifference(car1)).toEqual(['name', 'fuel']);
    });

    it('multi diff (single)', () => {
      const car1 = Car.fromJS({ name: 'artist', fuel: 'electric' });
      expect(car0.getDifference(car1, true)).toEqual(['name']);
    });
  });

  describe('equals', () => {
    it('is not equal if new value is explicitly set', () => {
      const car0 = Car.fromJS({ name: 'pouet' });
      const car1 = car0.change('driver', car0.get('driver'));

      expect(car0.equals(car1)).toEqual(false);
    });
  });

  describe('equivalent', () => {
    it('is equivalent if new value is explicitly set', () => {
      const car0 = Car.fromJS({ name: 'pouet' });
      const car1 = car0.change('driver', car0.get('driver'));

      expect(car0.equivalent(car1)).toEqual(true);
    });
  });

  describe('deepChange', () => {
    it('works', () => {
      const car = Car.fromJS({
        fuel: 'electric',
        name: 'ford',
        subCar: {
          name: 'focus',
          subCar: {
            name: 'focus2',
          },
        },
      });

      const newCar = car.deepChange('subCar.subCar', { name: 'anuford' });
      expect(newCar.deepGet('subCar.subCar.name')).toEqual('anuford');
    });

    it('works with default value for an immutable property', () => {
      const car = Car.fromJS({ fuel: 'electric', name: 'ford' });

      const newCar = car.deepChange('driver.name', 'mlem');
      expect(newCar.deepGet('driver.name')).toEqual('mlem');
    });
  });

  it('works with dates', () => {
    const car = Car.fromJS({
      name: 'ford',
      fuel: 'electric',
      createdOn: '2016-01-01T01:02:03.456Z',
    });

    expect(car.toJS()).toEqual({
      name: 'ford',
      fuel: 'electric',
      createdOn: new Date('2016-01-01T01:02:03.456Z'),
    });
  });

  it('works with errors', () => {
    expect(() => {
      Car.fromJS({ fuel: 'electric' } as any);
    }).toThrow('Car.name must be defined');

    expect(() => {
      Car.fromJS({ name: 'Ford', fuel: 'electric' });
    }).toThrow('Car.name must be lowercase');

    expect(() => {
      Car.fromJS({ name: 'ford', fuel: 'farts' });
    }).toThrow("Car.fuel can not have value 'farts' must be one of [gas, diesel, electric]");

    expect(() => {
      Car.fromJS({ name: 'ford', fuel: 'electric', range: 'lol' as any });
    }).toThrow('Car.range must be a number');

    expect(() => {
      Car.fromJS({ name: 'ford', fuel: 'electric', range: -3 });
    }).toThrow('Car.range must non negative positive');

    expect(() => {
      Car.fromJS({
        name: 'ford',
        fuel: 'electric',
        range: 30,
        relatedCars: 123 as any,
      });
    }).toThrow('expected relatedCars to be an array');

    expect(() => {
      Car.fromJS({
        name: 'ford',
        fuel: 'electric',
        range: 30,
        relatedCars: [
          { name: 'Toyota', fuel: 'electric', range: 31 },
          { name: 'Toyota', fuel: 'electric', range: 32 },
        ],
      });
    }).toThrow('Car.name must be lowercase');

    expect(() => {
      Car.fromJS({
        name: 'ford',
        fuel: 'electric',
        range: 30,
        createdOn: 'time for laughs',
      });
    }).toThrow('Car.createdOn must be a Date');
  });

  it('works with back compat', () => {
    expect(
      Car.fromJS({
        name: 'ford',
        fuelType: 'electric',
      } as any).toJS(),
    ).toEqual({
      name: 'ford',
      fuel: 'electric',
    });
  });

  it('works with deep get', () => {
    const car = Car.fromJS({
      fuel: 'electric',
      name: 'ford',
      subCar: {
        name: 'focus',
        subCar: {
          name: 'focus2',
        },
      },
    });
    expect(car.deepGet('subCar.subCar.name')).toEqual('focus2');
  });

  it('works with emptyArrayIsOk', () => {
    const car = Car.fromJS({
      fuel: 'electric',
      name: 'ford',
      owners: [],
    });

    expect(car.toJS()).toEqual({
      fuel: 'electric',
      name: 'ford',
      owners: [],
    });
  });

  it('works with types', () => {
    const car = Car.fromJS({
      fuel: 'electric',
      name: 'ford',
    });

    // should pass TS transpilation
    car.change('owners', ['foo']);

    // @ts-expect-error -- should NOT pass TS transpilation
    car.change('owners', 'foo');

    expect(() => {
      // @ts-expect-error -- should NOT pass TS transpilation
      car.change('some unknown prop', ['hello']);
    }).toThrowError();
  });

  it('should validate array values when PropertyType is set', () => {
    expect(() =>
      Car.fromJS({
        fuel: 'electric',
        name: 'ford',
        // @ts-expect-error -- like the compiled code will
        passengers: 'badString',
      }),
    ).toThrow('Car.passengers must be an Array');
  });

  it('should set PropertyType.ARRAY to empty array if not defined', () => {
    expect(
      Car.fromJS({
        fuel: 'electric',
        name: 'ford',
      }),
    ).toEqual({ fuel: 'electric', name: 'ford', passengers: [] });
  });
});
