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

import hasOwnProp from 'has-own-prop';

import { generalEqual } from '../equality/equality';
import { NamedArray } from '../named-array/named-array';

function firstUp(name: string): string {
  return name[0].toUpperCase() + name.slice(1);
}

function isDefined(v: any, emptyArrayIsOk: boolean | undefined) {
  return Array.isArray(v) ? v.length || emptyArrayIsOk : v != null;
}

function noop(v: any) {
  return v;
}

const EXPLAIN_UDFCF =
  'This might indicate that you are using "useDefineForClassFields" and forgot to use "declare" on an auto-generated getter property.';

export type Validator = (x: any) => void;

export interface ImmutableLike {
  fromJS: (js: any, context?: any) => any;
}

export type PropertyType = 'date' | 'array';
export const PropertyType = {
  DATE: 'date' as PropertyType,
  ARRAY: 'array' as PropertyType,
};

export interface Property<T extends Record<string, any> = any> {
  name: keyof T & string;
  defaultValue?: any;
  possibleValues?: readonly any[];
  validate?: Validator | Validator[];
  type?: PropertyType;
  immutableClass?: ImmutableLike;
  immutableClassArray?: ImmutableLike;
  equal?: (a: any, b: any) => boolean;
  toJS?: (v: any) => any; // todo.. stricter js type?
  contextTransform?: (context: Record<string, any>) => Record<string, any>;
  preserveUndefined?: boolean;
  emptyArrayIsOk?: boolean;
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
  equals(other: ImmutableInstanceType<ValueType, JSType> | undefined): boolean;
}

export interface BackCompat {
  condition: (js: any) => boolean;
  action: (js: any) => void;
}

export abstract class BaseImmutable<ValueType extends Record<string, any>, JSType>
  implements ImmutableInstanceType<ValueType, JSType>
{
  // This needs to be defined
  // abstract static PROPERTIES: Property[];

  static jsToValue<T extends Record<string, any> = any>(
    properties: Property<T>[],
    js: any,
    backCompats?: BackCompat[],
    context?: Record<string, any>,
  ): any {
    if (properties == null) {
      throw new Error(`JS is not defined`);
    }

    if (Array.isArray(backCompats)) {
      let jsCopied = false;
      for (const backCompat of backCompats) {
        if (backCompat.condition(js)) {
          if (!jsCopied) {
            js = JSON.parse(JSON.stringify(js));
            jsCopied = true;
          }
          backCompat.action(js);
        }
      }
    }

    const value: any = {};
    for (const property of properties) {
      const propertyName = property.name;
      if (typeof propertyName !== 'string') continue;

      const contextTransform = property.contextTransform || noop;
      let pv: any = js[propertyName];
      if (pv != null) {
        if (property.type === PropertyType.DATE) {
          pv = new Date(pv);
        } else if (property.immutableClass) {
          pv = property.immutableClass.fromJS(pv, context ? contextTransform(context) : undefined);
        } else if (property.immutableClassArray) {
          if (!Array.isArray(pv)) throw new Error(`expected ${propertyName} to be an array`);
          const propertyImmutableClassArray: any = property.immutableClassArray;
          pv = pv.map((v: any) =>
            propertyImmutableClassArray.fromJS(v, context ? contextTransform(context) : undefined),
          );
        }
      }
      value[propertyName] = pv;
    }
    return value;
  }

  static finalize(ClassFn: ClassFnType): void {
    const proto = (ClassFn as any).prototype;
    ClassFn.PROPERTIES.forEach((property: Property) => {
      const propertyName = property.name;
      if (typeof propertyName !== 'string') return;

      const defaultValue = property.defaultValue;
      const upped = firstUp(propertyName);
      const getUpped = 'get' + upped;
      const changeUpped = 'change' + upped;
      // These have to be `function` and not `=>` so that they do not bind 'this'
      proto[getUpped] =
        proto[getUpped] ||
        function (this: any) {
          const pv = this[propertyName];
          return pv != null ? pv : defaultValue;
        };
      proto[changeUpped] =
        proto[changeUpped] ||
        function (this: any, newValue: any): any {
          if (this[propertyName] === newValue) return this;
          const value = this.valueOf();
          value[propertyName] = newValue;
          return new this.constructor(value);
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
    },
  };

  constructor(value: ValueType) {
    const properties = this.ownProperties();
    for (const property of properties) {
      const propertyName = property.name;
      if (typeof propertyName !== 'string') continue;

      const propertyType = hasOwnProp(property, 'isDate') ? PropertyType.DATE : property.type;
      const pv = value[propertyName];

      if (pv == null) {
        if (propertyType === PropertyType.ARRAY) {
          (this as any)[propertyName] = [];
          continue;
        }

        if (!hasOwnProp(property, 'defaultValue')) {
          throw new Error(`${this.constructor.name}.${propertyName} must be defined`);
        }
      } else {
        const possibleValues = property.possibleValues;
        if (possibleValues && !possibleValues.includes(pv)) {
          throw new Error(
            `${
              this.constructor.name
            }.${propertyName} can not have value '${pv}' must be one of [${possibleValues.join(
              ', ',
            )}]`,
          );
        }

        if (property.type === PropertyType.DATE) {
          if (isNaN(pv)) {
            throw new Error(`${this.constructor.name}.${propertyName} must be a Date`);
          }
        }

        if (property.type === PropertyType.ARRAY) {
          if (!Array.isArray(pv)) {
            throw new Error(`${this.constructor.name}.${propertyName} must be an Array`);
          }
        }

        const validate = property.validate;
        if (validate) {
          const validators: Validator[] = Array.isArray(validate) ? validate : [validate];
          try {
            for (const validator of validators) validator(pv);
          } catch (e) {
            throw new Error(`${this.constructor.name}.${propertyName} ${(e as Error).message}`);
          }
        }
      }

      Object.defineProperty(this, propertyName, {
        value: pv,
        configurable: true,
        enumerable: true,
        writable: false,
      });
    }
  }

  public ownProperties(): Property<ValueType>[] {
    return (this.constructor as any).PROPERTIES;
  }

  public findOwnProperty(propName: keyof ValueType & string): Property | undefined {
    const properties = this.ownProperties();
    return NamedArray.findByName(properties, propName);
  }

  public hasProperty(propName: keyof ValueType & string): boolean {
    return this.findOwnProperty(propName) !== null;
  }

  public valueOf(): ValueType {
    const value: any = {};
    const properties = this.ownProperties();
    for (const property of properties) {
      const propertyName = property.name;
      value[propertyName] = (this as any)[propertyName];
    }
    return value;
  }

  public toJS(): JSType {
    const js: any = {};
    const properties = this.ownProperties();
    for (const property of properties) {
      const propertyName = property.name;
      let pv: any = (this as any)[propertyName];
      if (isDefined(pv, property.emptyArrayIsOk) || property.preserveUndefined) {
        if (typeof property.toJS === 'function') {
          const toJS = property.toJS;
          pv = property.immutableClassArray ? pv.map(toJS) : toJS(pv);
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
    const name: any = (this as any).name;
    const extra = name === 'string' ? `: ${name}` : '';
    return `[ImmutableClass${extra}]`;
  }

  public getDifference(
    other: BaseImmutable<ValueType, JSType> | undefined,
    returnOnFirstDifference = false,
  ): string[] {
    if (!other) return ['__no_other__'];
    if (this === other) return [];
    if (!(other instanceof this.constructor)) return ['__different_constructors__'];

    const differences: string[] = [];
    const properties = this.ownProperties();
    for (const property of properties) {
      const equal = property.equal || generalEqual;
      if (!equal((this as any)[property.name], (other as any)[property.name])) {
        const difference = property.name;

        if (returnOnFirstDifference) return [difference];

        differences.push(difference);
      }
    }

    return differences;
  }

  public equals(other: BaseImmutable<ValueType, JSType> | undefined): boolean {
    return this.getDifference(other, true).length === 0;
  }

  public equivalent(other: BaseImmutable<ValueType, JSType>): boolean {
    if (!other) return false;
    if (this === other) return true;
    if (!(other instanceof this.constructor)) return false;

    const properties = this.ownProperties();
    for (const property of properties) {
      const propertyName = property.name;
      const equal = property.equal || generalEqual;
      if (!equal(this.get(propertyName), other.get(propertyName))) return false;
    }

    return true;
  }

  public get<T extends keyof ValueType & string>(propName: T): ValueType[T] {
    const getter = (this as any)['get' + firstUp(propName)];
    if (!getter) {
      const msg = `No getter was found for "${propName}"`;
      if (Object.getOwnPropertyDescriptor(this, 'get' + firstUp(propName))) {
        throw new Error(msg + ' but it is defined as a property. ' + EXPLAIN_UDFCF);
      } else {
        throw new Error(msg + '.');
      }
    }
    return getter.call(this);
  }

  public change<T extends keyof ValueType & string>(propName: T, newValue: ValueType[T]): this {
    const changer = (this as any)['change' + firstUp(propName)];
    if (!changer) {
      const msg = `No changer was found for "${propName}"`;
      if (Object.getOwnPropertyDescriptor(this, 'change' + firstUp(propName))) {
        throw new Error(msg + ' but it is defined as a property. ' + EXPLAIN_UDFCF);
      } else {
        throw new Error(msg + '.');
      }
    }
    return changer.call(this, newValue);
  }

  public changeMany(properties: Partial<ValueType>): this {
    if (!properties) throw new TypeError('Invalid properties object');

    let o = this;

    for (const propName in properties) {
      if (!this.hasProperty(propName)) throw new Error('Unknown property: ' + propName);

      // Added ! because TypeScript thinks a Partial can have undefined properties
      // (which they can and it's cool)
      // https://github.com/Microsoft/TypeScript/issues/13195
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      o = o.change(propName, properties[propName]!);
    }

    return o;
  }

  public deepChange(propName: string, newValue: any): this {
    const bits = propName.split('.');
    let lastObject = newValue;
    let currentObject: any;

    const getLastObject = () => {
      let o: any = this;

      for (let i = 0; i < bits.length; i++) {
        o = o['get' + firstUp(bits[i])]();
      }

      return o;
    };

    while (bits.length) {
      const bit = bits.pop();

      currentObject = getLastObject();

      if (currentObject.change instanceof Function) {
        lastObject = currentObject.change(bit, lastObject);
      } else {
        const message = "Can't find `change()` method on " + currentObject.constructor.name;
        throw new Error(message);
      }
    }

    return lastObject;
  }

  public deepGet(propName: string): any {
    let value = this as any;
    const bits = propName.split('.');
    let bit;
    while ((bit = bits.shift())) {
      const specializedGetterName = `get${firstUp(bit)}`;
      const specializedGetter = value[specializedGetterName];
      value = specializedGetter
        ? specializedGetter.call(value)
        : value.get
          ? value.get(bit)
          : value[bit];
    }

    return value;
  }
}
