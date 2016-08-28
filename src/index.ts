/*
 * Copyright 2014-2015 Metamarkets Group Inc.
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

export * from './utils/utils';
export * from './equality/equality';
export * from './simple-array/simple-array';
export * from './named-array/named-array';
export * from './base-immutable/base-immutable';

/**
 * Interface that the Immutable Class class should extend (types the instance)
 */
export interface Instance<ValueType, JSType> {
  valueOf(): ValueType;
  toJS(): JSType;
  toJSON(): JSType;
  equals(other: Instance<ValueType, JSType>): boolean;
}

/**
 * Interface that the Immutable Class class should conform to (types the class)
 */
export interface Class<ValueType, JSType> {
  fromJS(properties: JSType): Instance<ValueType, JSType>;
  new (properties: ValueType): any;
}
