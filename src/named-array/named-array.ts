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

import { SimpleArray } from '../simple-array/simple-array';
import { immutableEqual } from '../equality/equality';

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

export class NamedArray {
  static isValid<T extends Nameable>(array: T[]): boolean {
    let seen: { [k: string]: number } = {};
    for (let a of array) {
      let name = a.name;
      if (seen[name]) return false;
      seen[name] = 1;
    }
    return true;
  }

  static checkValid<T extends Nameable>(array: T[]): void {
    let seen: { [k: string]: number } = {};
    for (let a of array) {
      let name = a.name;
      if (seen[name]) throw new Error(`duplicate '${name}'`);
      seen[name] = 1;
    }
  }

  static get<T extends Nameable>(array: T[], name: string): T {
    return SimpleArray.find(array, (x) => x.name === name);
  }

  static containsByName<T extends Nameable>(array: T[], name: string): boolean {
    return SimpleArray.contains(array, (x) => x.name === name);
  }

  static findByNameCI<T extends Nameable>(array: T[], name: string): T {
    let lowerName = name.toLowerCase();
    return SimpleArray.find(array, (x) => x.name.toLowerCase() === lowerName);
  }

  static findByName<T extends Nameable>(array: T[], name: string): T {
    return NamedArray.get(array, name);
  }

  static findIndexByName<T extends Nameable>(array: T[], name: string): number {
    return SimpleArray.findIndex(array, (x) => x.name === name);
  }

  static overrideByName<T extends Nameable>(things: T[], thingOverride: T): T[] {
    let overrideName = thingOverride.name;
    let added = false;
    things = things.map(t => {
      if (t.name === overrideName) {
        added = true;
        return thingOverride;
      } else {
        return t;
      }
    });
    if (!added) things.push(thingOverride);
    return things;
  }

  static overridesByName<T extends Nameable>(things: T[], thingOverrides: T[]): T[] {
    for (let thingOverride of thingOverrides) {
      things = NamedArray.overrideByName(things, thingOverride);
    }
    return things;
  }

  static deleteByName<T extends Nameable>(array: T[], name: string): T[] {
    return array.filter((a) => a.name !== name);
  }

  static synchronize<T>(oldThings: T[], newThings: T[], updatedOptions: SynchronizerOptions<T>): void {
    const key = updatedOptions.key || getName;
    const equals = updatedOptions.equals || (immutableEqual as any);
    const onEnter = updatedOptions.onEnter || noop;
    const onUpdate = updatedOptions.onUpdate || noop;
    const onExit = updatedOptions.onExit || noop;

    let initialByKey: { [k: string]: T } = Object.create(null);
    for (let i = 0; i < oldThings.length; i++) {
      let initialThing = oldThings[i];
      let initialThingKey = key(initialThing);
      if (initialByKey[initialThingKey]) throw new Error(`duplicate key '${initialThingKey}'`);
      initialByKey[initialThingKey] = initialThing;
    }

    for (let j = 0; j < newThings.length; j++) {
      let newThing = newThings[j];
      let newThingKey = key(newThing);
      let oldThing = initialByKey[newThingKey];
      if (oldThing) {
        if (!equals(newThing, oldThing)) {
          onUpdate(newThing, oldThing);
        }
        delete initialByKey[newThingKey];
      } else {
        onEnter(newThing);
      }
    }

    for (let k in initialByKey) {
      if (!initialByKey[k]) continue;
      onExit(initialByKey[k]);
    }
  }

}


