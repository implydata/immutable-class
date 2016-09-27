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
import { NamedArray } from "../named-array/named-array";

function firstUp(name: string): string {
  return name[0].toUpperCase() + name.substr(1);
}

function isDefined(v: any) {
  return Array.isArray(v) ? v.length : v != null;
}

function noop(v: any) {
  return v;
}

export interface Validator {
  (x: any): void;
}

export interface ImmutableLike {
  fromJS: (js: any) => any;
}

export type PropertyType = 'date' | 'array';
export const PropertyType = {
  DATE: 'date' as PropertyType,
  ARRAY: 'array' as PropertyType
};

export interface Property {
  name: string;
  defaultValue?: any;
  possibleValues?: any[];
  validate?: Validator | Validator[];
  type?: PropertyType;
  immutableClass?: ImmutableLike;
  immutableClassArray?: ImmutableLike;
  equal?: (a: any, b: any) => boolean;
  toJS?: (v: any) => any; // todo.. stricter js type?
  contextTransform?: (context: { [key: string]: any }) => { [key: string]: any };
}

export interface ClassFnType {
  PROPERTIES: Property[];
  fromJS(properties: any, context?: any): any;
  new (properties: any): any;
}

export interface BackCompat {
  condition: (js: any) => boolean;
  action: (js: any) => void;
}

export abstract class BaseImmutable<ValueType, JSType> {
  // This needs to be defined
  //abstract static PROPERTIES: Property[];

  static jsToValue(properties: Property[], js: any, backCompats?: BackCompat[], context?: { [key: string]: any }): any {
    if (properties == null) {
      throw new Error(`JS is not defined`);
    }

    if (Array.isArray(backCompats)) {
      var jsCopied = false;
      for (var backCompat of backCompats) {
        if (backCompat.condition(js)) {
          if (!jsCopied) {
            js = JSON.parse(JSON.stringify(js));
            jsCopied = true;
          }
          backCompat.action(js);
        }
      }
    }

    var value: any = {};
    for (var property of properties) {
      var propertyName = property.name;
      var contextTransform = property.contextTransform || noop;
      var pv: any = js[propertyName];
      if (pv != null) {
        if (property.type === PropertyType.DATE) {
          pv = new Date(pv);

        } else if (property.immutableClass) {
          pv = (property.immutableClass as any).fromJS(pv, contextTransform(context));

        } else if (property.immutableClassArray) {
          if (!Array.isArray(pv)) throw new Error(`expected ${propertyName} to be an array`);
          var propertyImmutableClassArray: any = property.immutableClassArray;
          pv = pv.map((v: any) => propertyImmutableClassArray.fromJS(v, contextTransform(context)));

        }
      }
      value[propertyName] = pv;
    }
    return value;
  }

  static finalize(ClassFn: ClassFnType): void {
    var proto = (ClassFn as any).prototype;
    ClassFn.PROPERTIES.forEach((property: Property) => {
      var propertyName = property.name;
      var defaultValue = property.defaultValue;
      var upped = firstUp(property.name);
      var getUpped = 'get' + upped;
      var changeUpped = 'change' + upped;
      // These have to be function and not => so that they do not bind 'this'
      proto[getUpped] = proto[getUpped] || function() {
        var pv = (this as any)[propertyName];
        return pv != null ? pv : defaultValue;
      };
      proto[changeUpped] = proto[changeUpped] || function(newValue: any): any {
        var value = this.valueOf();
        value[propertyName] = newValue;
        return new (this.constructor as any)(value);
      };
    });
  }

  static ensure = {
    number: (n: any): void => {
      if (isNaN(n) || typeof n !== 'number') throw new Error(`must be a number`);
    },
    positive: (n: any): void => {
      if (n < 0) throw new Error('must be positive');
    },
    nonNegative: (n: any): void => {
      if (n < 0) throw new Error('must be non negative');
    }
  };

  constructor(value: ValueType) {
    var properties = this.ownProperties();
    for (var property of properties) {
      var propertyName = property.name;
      var propertyType = property.hasOwnProperty('isDate') ? PropertyType.DATE : property.type;
      var pv = (value as any)[propertyName];

      if (pv == null) {
        if (propertyType === PropertyType.ARRAY) {
          (this as any)[propertyName] = [];
          continue;
        }

        if (!property.hasOwnProperty('defaultValue')) {
          throw new Error(`${(this.constructor as any).name}.${propertyName} must be defined`);
        }
      } else {
        var possibleValues = property.possibleValues;
        if (possibleValues && possibleValues.indexOf(pv) === -1) {
          throw new Error(`${(this.constructor as any).name}.${propertyName} can not have value '${pv}' must be one of [${possibleValues.join(', ')}]`);
        }

        if (property.type === PropertyType.DATE) {
          if (isNaN(pv)) {
            throw new Error(`${(this.constructor as any).name}.${propertyName} must be a Date`);
          }
        }

        var validate = property.validate;
        if (validate) {
          var validators: Validator[] = Array.isArray(validate) ? validate : [validate];
          try {
            for (var validator of validators) validator(pv);
          } catch (e) {
            throw new Error(`${(this.constructor as any).name}.${propertyName} ${e.message}`);
          }
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
    return NamedArray.findByName(properties, propName);
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
      var pv: any = (this as any)[propertyName];
      if (isDefined(pv)) {
        if (typeof property.toJS === 'function') {
          pv = property.toJS(pv);
        } else if (property.immutableClass) {
          pv = pv.toJS();
        } else if (property.immutableClassArray) {
          pv = pv.map((v: any) => v.toJS());
        }
        js[propertyName] = pv;
      }
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
    const getter = (this as any)['get' + firstUp(propName)];
    if (!getter) throw new Error(`can not find prop ${propName}`);
    return getter.call(this);
  }

  public change(propName: string, newValue: any): this {
    const changer = (this as any)['change' + firstUp(propName)];
    if (!changer) throw new Error(`can not find prop ${propName}`);
    return changer.call(this, newValue);
  }
}
