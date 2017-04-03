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

export interface PassengerValue {
  name: string;
}

export interface PassengerJS {
  name: string;
}

export class Passenger extends BaseImmutable<PassengerValue, PassengerJS> {
  static PROPERTIES: Property[] = [
    {
      name: 'name'
    }
  ];

  static isPassenger(car: Passenger) {
    return car instanceof Passenger;
  }

  static fromJS(properties: PassengerJS) {
    return new Passenger(BaseImmutable.jsToValue(Passenger.PROPERTIES, properties));
  }


  public name: string;

  constructor(properties: PassengerValue) {
    super(properties);
  }

  public getName: () => string;


}
BaseImmutable.finalize(Passenger);
