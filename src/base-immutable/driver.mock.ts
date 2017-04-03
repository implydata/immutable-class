/*
 * Copyright 2016 Imply Data, Inc.
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

import { BaseImmutable, Property, PropertyType, BackCompat } from './base-immutable';

export interface DriverValue {
  name: string;
}

export interface DriverJS {
  name: string;
}

export class Driver extends BaseImmutable<DriverValue, DriverJS> {
  static PROPERTIES: Property[] = [
    {
      name: 'name'
    }
  ];

  static isDriver(car: Driver) {
    return car instanceof Driver;
  }

  static fromJS(properties: DriverJS) {
    return new Driver(BaseImmutable.jsToValue(Driver.PROPERTIES, properties));
  }


  public name: string;

  constructor(properties: DriverValue) {
    super(properties);
  }

  public getName: () => string;


}
BaseImmutable.finalize(Driver);
