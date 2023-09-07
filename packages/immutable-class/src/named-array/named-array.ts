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

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { immutableEqual } from '../equality/equality';
import { KeyedArray } from '../keyed-array/keyed-array';
import { SimpleArray } from '../simple-array/simple-array';

export type DiffAction = 'create' | 'update' | 'delete';

export interface Nameable {
  name: string;
}

function getName(thing: any): string {
  return thing.name;
}

function noop() {}

export interface SynchronizerOptions<T> {
  key?: (thing: T, index?: number) => string;
  equals?: (thingA: T, thingB: T) => boolean;
  onEnter?: (newThing: T) => void;
  onUpdate?: (newThing: T, oldThing: T) => void;
  onExit?: (oldThing: T) => void;
}

export interface DiffJS {
  before?: any;
  after?: any;
}

export class Diff<T extends Nameable> {
  static inflateFromJS<T extends Nameable>(
    Class: { fromJS: (js: any, context?: any) => T },
    diffJS: DiffJS,
    context?: any,
  ): Diff<T> {
    let before: T | undefined;
    let after: T | undefined;
    if (diffJS.before) before = Class.fromJS(diffJS.before, context);
    if (diffJS.after) after = Class.fromJS(diffJS.after, context);
    return new Diff(before, after);
  }

  static inflateFromJSs<T extends Nameable>(
    Class: { fromJS: (js: any, context?: any) => T },
    diffJSs: DiffJS[],
    context?: any,
  ): Diff<T>[] {
    if (!Array.isArray(diffJSs)) throw new Error('diffs must be an array');
    return diffJSs.map(diffJS => Diff.inflateFromJS<T>(Class, diffJS, context));
  }

  public before?: T;
  public after?: T;

  constructor(before: T | undefined, after: T | undefined) {
    if (!before && !after) throw new Error('must have either a before or an after');
    if (before && after && before.name !== after.name)
      throw new Error('before and after name must match');
    this.before = before;
    this.after = after;
  }

  toJS(): DiffJS {
    const js: DiffJS = {};
    if (this.before) js.before = this.before;
    if (this.after) js.after = this.after;
    return js;
  }

  toJSON() {
    return this.toJS();
  }

  getAction(): DiffAction {
    if (this.before) {
      return this.after ? 'update' : 'delete';
    } else {
      return 'create';
    }
  }

  getName(): string {
    const { before, after } = this;
    if (before) return before.name;
    if (after) return after.name;
    throw new Error(`Invalid diff, no before or after`);
  }
}

const KEYED_ARRAY = KeyedArray.withKey('name');
export class NamedArray {
  static isValid<T extends Nameable>(array: T[]): boolean {
    return KEYED_ARRAY.isValid(array);
  }

  static checkValid<T extends Nameable>(array: T[], what?: string, where?: string): void {
    return KEYED_ARRAY.checkValid(array, what, where);
  }

  static get<T extends Nameable>(array: T[], name: string): T {
    return KEYED_ARRAY.get(array, name);
  }

  static toRecord<T extends NamedArray>(array: T[]): Record<string, T> {
    return KEYED_ARRAY.toRecord(array);
  }

  static containsByName<T extends Nameable>(array: T[], name: string): boolean {
    return SimpleArray.contains(array, x => x.name === name);
  }

  static findByNameCI<T extends Nameable>(array: T[], name: string): T | undefined {
    const lowerName = name.toLowerCase();
    return SimpleArray.find(array, x => x.name.toLowerCase() === lowerName);
  }

  static findByName<T extends Nameable>(array: T[], name: string): T | undefined {
    return NamedArray.get(array, name);
  }

  static findIndexByName<T extends Nameable>(array: T[], name: string): number {
    return SimpleArray.findIndex(array, x => x.name === name);
  }

  static overrideByName<T extends Nameable>(things: T[], thingOverride: T): T[] {
    return KEYED_ARRAY.overrideByKey(things, thingOverride);
  }

  static overridesByName<T extends Nameable>(things: T[], thingOverrides: T[]): T[] {
    return KEYED_ARRAY.overridesByKey(things, thingOverrides);
  }

  static dedupe<T extends Nameable>(things: T[]): T[] {
    return KEYED_ARRAY.dedupe(things);
  }

  static deleteByName<T extends Nameable>(array: T[], name: string): T[] {
    return KEYED_ARRAY.deleteByKey(array, name);
  }

  static synchronize<T>(
    oldThings: T[],
    newThings: T[],
    updatedOptions: SynchronizerOptions<T>,
  ): void {
    const key = updatedOptions.key || getName;
    const equals = updatedOptions.equals || (immutableEqual as any);
    const onEnter = updatedOptions.onEnter || noop;
    const onUpdate = updatedOptions.onUpdate || noop;
    const onExit = updatedOptions.onExit || noop;

    const initialByKey: Record<string, T> = Object.create(null);
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < oldThings.length; i++) {
      const initialThing = oldThings[i];
      const initialThingKey = key(initialThing);
      if (initialByKey[initialThingKey]) throw new Error(`duplicate key '${initialThingKey}'`);
      initialByKey[initialThingKey] = initialThing;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let j = 0; j < newThings.length; j++) {
      const newThing = newThings[j];
      const newThingKey = key(newThing);
      const oldThing = initialByKey[newThingKey];
      if (oldThing) {
        if (!equals(newThing, oldThing)) {
          onUpdate(newThing, oldThing);
        }
        delete initialByKey[newThingKey];
      } else {
        onEnter(newThing);
      }
    }

    for (const k in initialByKey) {
      if (!initialByKey[k]) continue;
      onExit(initialByKey[k]);
    }
  }

  static computeDiffs<T extends Nameable>(oldThings: T[], newThings: T[]): Diff<T>[] {
    const dataCubeDiffs: Diff<T>[] = [];
    NamedArray.synchronize(oldThings, newThings, {
      onExit: oldDataCube => {
        dataCubeDiffs.push(new Diff<T>(oldDataCube, undefined));
      },
      onUpdate: (newDataCube, oldDataCube) => {
        dataCubeDiffs.push(new Diff<T>(oldDataCube, newDataCube));
      },
      onEnter: newDataCube => {
        dataCubeDiffs.push(new Diff<T>(undefined, newDataCube));
      },
    });
    return dataCubeDiffs;
  }
}
