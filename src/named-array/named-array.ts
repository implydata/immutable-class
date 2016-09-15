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

export interface Nameable {
  name: string;
}

export class NamedArray {
  static isValid<T extends Nameable>(array: T[]): boolean {
    var seen: { [k: string]: number } = {};
    for (var a of array) {
      var name = a.name;
      if (seen[name]) return false;
      seen[name] = 1;
    }
    return true;
  }

  static checkValid<T extends Nameable>(array: T[]): void {
    var seen: { [k: string]: number } = {};
    for (var a of array) {
      var name = a.name;
      if (seen[name]) throw new Error(`duplicate '${name}'`);
      seen[name] = 1;
    }
  }

  static get<T extends Nameable>(array: T[], name: string): T {
    return SimpleArray.find(array, (x) => x.name === name);
  }

  static findByNameCI<T extends Nameable>(array: T[], name: string): T {
    return SimpleArray.find(array, (x) => x.name.toLowerCase() === name.toLowerCase());
  }

  static findByName<T extends Nameable>(array: T[], name: string): T {
    return NamedArray.get(array, name);
  }

  static findIndexByName<T extends Nameable>(array: T[], name: string): number {
    return SimpleArray.findIndex(array, (x) => x.name === name);
  }

  static overrideByName<T extends Nameable>(things: T[], thingOverride: T): T[] {
    var overrideName = thingOverride.name;
    var added = false;
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
    for (var thingOverride of thingOverrides) {
      things = NamedArray.overrideByName(things, thingOverride);
    }
    return things;
  }

  static deleteByName<T extends Nameable>(array: T[], name: string): T[] {
    return array.filter((a) => a.name !== name);
  }

}


