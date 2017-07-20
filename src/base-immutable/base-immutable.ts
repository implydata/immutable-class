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

import * as hasOwnProp from 'has-own-prop';
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
  fromJS: (js: any, context?: any) => any;
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
  preserveUndefined?: boolean;
}

export interface ClassFnType {
  PROPERTIES: Property[];
  fromJS(properties: any, context?: any): any;
  new (properties: any): any;
}

export interface ImmutableInstanceType<ValueType, JSType> {
  valueOf(): ValueType;
  toJS(): JSType;
  toJSON(): JSType;
  toString(): string;
  equals(other: ImmutableInstanceType<ValueType, JSType>): boolean;
}

export interface BackCompat {
  condition: (js: any) => boolean;
  action: (js: any) => void;
}

export abstract class BaseImmutable<ValueType, JSType> implements ImmutableInstanceType<ValueType, JSType> {
  // This needs to be defined
  //abstract static PROPERTIES: Property[];

  static jsToValue(properties: Property[], js: any, backCompats?: BackCompat[], context?: { [key: string]: any }): any {
    if (properties == null) {
      throw new Error(`JS is not defined`);
    }

    if (Array.isArray(backCompats)) {
      let jsCopied = false;
      for (let backCompat of backCompats) {
        if (backCompat.condition(js)) {
          if (!jsCopied) {
            js = JSON.parse(JSON.stringify(js));
            jsCopied = true;
          }
          backCompat.action(js);
        }
      }
    }

    let value: any = {};
    for (let property of properties) {
      let propertyName = property.name;
      let contextTransform = property.contextTransform || noop;
      let pv: any = js[propertyName];
      if (pv != null) {
        if (property.type === PropertyType.DATE) {
          pv = new Date(pv);

        } else if (property.immutableClass) {
          pv = (property.immutableClass as any).fromJS(pv, contextTransform(context));

        } else if (property.immutableClassArray) {
          if (!Array.isArray(pv)) throw new Error(`expected ${propertyName} to be an array`);
          let propertyImmutableClassArray: any = property.immutableClassArray;
          pv = pv.map((v: any) => propertyImmutableClassArray.fromJS(v, contextTransform(context)));

        }
      }
      value[propertyName] = pv;
    }
    return value;
  }

  static finalize(ClassFn: ClassFnType): void {
    let proto = (ClassFn as any).prototype;
    ClassFn.PROPERTIES.forEach((property: Property) => {
      let propertyName = property.name;
      let defaultValue = property.defaultValue;
      let upped = firstUp(property.name);
      let getUpped = 'get' + upped;
      let changeUpped = 'change' + upped;
      // These have to be `function` and not `=>` so that they do not bind 'this'
      proto[getUpped] = proto[getUpped] || function() {
        let pv = (this as any)[propertyName];
        return pv != null ? pv : defaultValue;
      };
      proto[changeUpped] = proto[changeUpped] || function(newValue: any): any {
        let value = this.valueOf();
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
    let properties = this.ownProperties();
    for (let property of properties) {
      let propertyName = property.name;
      let propertyType = hasOwnProp(property, 'isDate') ? PropertyType.DATE : property.type;
      let pv = (value as any)[propertyName];

      if (pv == null) {
        if (propertyType === PropertyType.ARRAY) {
          (this as any)[propertyName] = [];
          continue;
        }

        if (!hasOwnProp(property, 'defaultValue')) {
          throw new Error(`${(this.constructor as any).name}.${propertyName} must be defined`);
        }
      } else {
        let possibleValues = property.possibleValues;
        if (possibleValues && possibleValues.indexOf(pv) === -1) {
          throw new Error(`${(this.constructor as any).name}.${propertyName} can not have value '${pv}' must be one of [${possibleValues.join(', ')}]`);
        }

        if (property.type === PropertyType.DATE) {
          if (isNaN(pv)) {
            throw new Error(`${(this.constructor as any).name}.${propertyName} must be a Date`);
          }
        }

        let validate = property.validate;
        if (validate) {
          let validators: Validator[] = Array.isArray(validate) ? validate : [validate];
          try {
            for (let validator of validators) validator(pv);
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
    let properties = this.ownProperties();
    return NamedArray.findByName(properties, propName);
  }

  public hasProperty(propName: string): boolean {
    return this.findOwnProperty(propName) !== null;
  }

  public valueOf(): ValueType {
    let value: any = {};
    let properties = this.ownProperties();
    for (let property of properties) {
      let propertyName = property.name;
      value[propertyName] = (this as any)[propertyName];
    }
    return value;
  }

  public toJS(): JSType {
    let js: any = {};
    let properties = this.ownProperties();
    for (let property of properties) {
      let propertyName = property.name;
      let pv: any = (this as any)[propertyName];
      if (isDefined(pv) || property.preserveUndefined) {
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
    let name: any = (this as any).name;
    let extra = name === 'string' ? `: ${name}` : '';
    return `[ImmutableClass${extra}]`;
  }

  public equals(other: BaseImmutable<ValueType, JSType>): boolean {
    if (!other) return false;
    if (this === other) return true;
    if (!(other instanceof this.constructor)) return false;

    let properties = this.ownProperties();
    for (let property of properties) {
      let propertyName = property.name;
      let equal = property.equal || generalEqual;
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

  public changeMany(properties: Record<string, any>): this {
    if (!properties) throw new TypeError('Invalid properties object');

    let o = this;

    for (let propName in properties) {
      if (!this.hasProperty(propName)) throw new Error('Unknown property: ' + propName);

      o = o.change(propName, properties[propName]);
    }

    return o;
  }

  public deepChange(propName: string, newValue: any): this {
    let bits = propName.split('.');
    let lastObject = newValue;
    let currentObject: any;

    let getLastObject = () => {
      let o: any = this;

      for (let i = 0; i < bits.length; i++) {
        o = o[bits[i]];
      }

      return o;
    };

    while (bits.length) {
      let bit = bits.pop();

      currentObject = getLastObject();
      if (currentObject.change instanceof Function) {
        lastObject = currentObject.change(bit, lastObject);
      } else {
        let message = 'Can\'t find \`change()\` method on ' + currentObject.constructor.name;
        throw new Error(message);
      }
    }

    return lastObject;
  }

  public deepGet(propName: string): any {
    let value = this as any;
    let bits = propName.split('.');
    let bit: string;
    while (bit = bits.shift()) {
      let specializedGetterName = `get${firstUp(bit)}`;
      let specializedGetter = value[specializedGetterName];
      value = specializedGetter ? specializedGetter.call(value)
        : value.get ? value.get(bit)
        : value[bit];
    }

    return value as any;
  }
}
