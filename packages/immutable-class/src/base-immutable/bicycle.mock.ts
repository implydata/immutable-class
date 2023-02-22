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

import type { Property } from './base-immutable';
import { BaseImmutable } from './base-immutable';

export interface RiderValue {
  name: string;
}

export interface RiderJS {
  name: string;
}

export class Rider extends BaseImmutable<RiderValue, RiderJS> {
  static PROPERTIES: Property[] = [{ name: 'name', defaultValue: null }];

  static fromJS(params: RiderValue) {
    return new Rider(BaseImmutable.jsToValue(Rider.PROPERTIES, params));
  }

  constructor(params: RiderValue) {
    super(params);
  }

  // These will cause get() and change() to fail
  public getName!: () => string;
  public changeName!: (name: string) => Rider;
}
BaseImmutable.finalize(Rider);

export interface BicycleValue {
  name: string;
  fuel: string;
}

export interface BicycleJS {
  name: string;
  fuel?: string;
}

export class Bicycle extends BaseImmutable<BicycleValue, BicycleJS> {
  static PROPERTIES: Property<BicycleValue>[] = [
    {
      name: 'name',
      validate: (n: string) => {
        if (n.toLowerCase() !== n) throw new Error('must be lowercase');
      },
    },
    {
      name: 'fuel',
      defaultValue: 'turnip',
      possibleValues: ['potato', 'turnip'],
    },
  ];

  static fromJS(params: BicycleJS) {
    return new Bicycle(BaseImmutable.jsToValue(Bicycle.PROPERTIES, params));
  }

  constructor(params: BicycleValue) {
    super(params);
    this.name = params.name;
  }

  public readonly name: string;
  public declare fuel: string;
}
BaseImmutable.finalize(Bicycle);
