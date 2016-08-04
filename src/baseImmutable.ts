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

import { isInstanceOf } from './utils';
import { generalEqual } from './equality';

export interface Property {
  name: string;
  defaultValue?: any;
  immutableClass?: typeof BaseImmutable;
  equal?: (a: any, b: any) => boolean;
}

export abstract class BaseImmutable<ValueType, JSType> {
  // This needs to be defined
  //abstract static PROPERTIES: Property[];

  static jsToValue(properties: Property[], js: any): any {
    var value: any = {};
    for (var property of properties) {
      var propertyName = property.name;
      var propertyImmutableClass = property.immutableClass;
      var pv = js[propertyName];
      value[propertyName] = pv ? (propertyImmutableClass ? (propertyImmutableClass as any).fromJS(pv) : pv) : null;
    }
    return value;
  }

  constructor(value: ValueType) {
    var properties = this.getProperties();
    for (var property of properties) {
      var propertyName = property.name;
      (this as any)[propertyName] = (value as any)[propertyName];
    }
  }

  public getProperties(): Property[] {
    return (this.constructor as any).PROPERTIES;
  }

  public valueOf(): ValueType {
    var value: any = {};
    var properties = this.getProperties();
    for (var property of properties) {
      var propertyName = property.name;
      value[propertyName] = (this as any)[propertyName];
    }
    return value;
  }

  public toJS(): JSType {
    var js: any = {};
    var properties = this.getProperties();
    for (var property of properties) {
      var propertyName = property.name;
      var propertyImmutableClass = property.immutableClass;
      var pv = (this as any)[propertyName];
      if (pv != null) js[propertyName] = propertyImmutableClass ? pv.toJS() : pv;
    }
    return js;
  }

  public toJSON(): JSType {
    return this.toJS();
  }

  public toString(): string {
    return '[ImmutableClass]';
  }

  public equals(other: BaseImmutable<ValueType, JSType>): boolean {
    if (!other) return false;
    if (this === other) return true;
    if (!isInstanceOf(other, this.constructor)) return false;

    var properties = this.getProperties();
    for (var property of properties) {
      var propertyName = property.name;
      var equal = property.equal || generalEqual;
      if (!equal((this as any)[propertyName], (other as any)[propertyName])) return false;
    }

    return true;
  }

  public get(propName: string): any {
    var properties = this.getProperties();
    for (var property of properties) {
      if (property.name === propName) {
        return (this as any)[propName] || property.defaultValue;
      }
    }
    throw new Error(`can not find prop ${propName}`);
  }
}
