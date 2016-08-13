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

import { isInstanceOf } from '../utils/utils';
import { generalEqual } from '../equality/equality';

function firstUp(name: string): string {
  return name[0].toUpperCase() + name.substr(1);
}

export interface Property {
  name: string;
  defaultValue?: any;
  possibleValues?: any[];
  validate?: (x: any) => void;
  immutableClass?: typeof BaseImmutable;
  equal?: (a: any, b: any) => boolean;
}

export interface ClassFnType {
  PROPERTIES: Property[];
  fromJS(properties: any): any;
  new (properties: any): any;
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

  static finalize(ClassFn: ClassFnType): void {
    var proto = (ClassFn as any).prototype;
    ClassFn.PROPERTIES.forEach((property: Property) => {
      var propertyName = property.name;
      var upped = firstUp(property.name);
      // These have to be function and not => so that they do not bind this
      proto['get' + upped] = function() {
        return (this as any).get(propertyName);
      };
      proto['change' + upped] = function(newValue: any): any {
        return (this as any).change(propertyName, newValue);
      };
    });
  }

  constructor(value: ValueType) {
    var properties = this.ownProperties();
    for (var property of properties) {
      var propertyName = property.name;
      var pv = (value as any)[propertyName];

      if (!property.hasOwnProperty('defaultValue') && pv == null) {
        throw new Error(`${(this.constructor as any).name}.${propertyName} must be defined`);
      }

      var possibleValues = property.possibleValues;
      if (pv != null && possibleValues && possibleValues.indexOf(pv) === -1) {
        throw new Error(`${(this.constructor as any).name}.${propertyName} can not have value '${pv}' must be one of [${possibleValues.join(', ')}]`);
      }

      if (property.validate) {
        try {
          property.validate(pv);
        } catch (e) {
          throw new Error(`${(this.constructor as any).name}.${propertyName} ${e.message}`);
        }
      }

      (this as any)[propertyName] = pv;
    }
  }

  public ownProperties(): Property[] {
    return (this.constructor as any).PROPERTIES;
  }

  public findOwnProperty(propName: string): Property | null {
    var properties = this.ownProperties();
    return properties.filter(p => p.name === propName)[0] || null; // ToDo: replace redneck find with real find
  }

  public valueOf(): ValueType {
    var value: any = {};
    var properties = this.ownProperties();
    for (var property of properties) {
      var propertyName = property.name;
      value[propertyName] = (this as any)[propertyName];
    }
    return value;
  }

  public toJS(): JSType {
    var js: any = {};
    var properties = this.ownProperties();
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
    var name: any = (this as any).name;
    var extra = name === 'string' ? `: ${name}` : '';
    return `[ImmutableClass${extra}]`;
  }

  public equals(other: BaseImmutable<ValueType, JSType>): boolean {
    if (!other) return false;
    if (this === other) return true;
    if (!isInstanceOf(other, this.constructor)) return false;

    var properties = this.ownProperties();
    for (var property of properties) {
      var propertyName = property.name;
      var equal = property.equal || generalEqual;
      if (!equal((this as any)[propertyName], (other as any)[propertyName])) return false;
    }

    return true;
  }

  public get(propName: string): any {
    var properties = this.ownProperties();
    for (var property of properties) {
      if (property.name === propName) {
        return (this as any)[propName] || property.defaultValue;
      }
    }
    throw new Error(`can not find prop ${propName}`);
  }

  public change(propName: string, newValue: any): this {
    var value = this.valueOf();

    var property = this.findOwnProperty(propName);
    if (!property) {
      throw new Error(`Unknown property: ${propName}`);
    }

    (value as any)[propName] = newValue;
    return new (this.constructor as any)(value);
  }
}
