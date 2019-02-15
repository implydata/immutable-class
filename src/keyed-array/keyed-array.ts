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

import * as hasOwnProp from 'has-own-prop';
import { SimpleArray } from '../simple-array/simple-array';

export type KeyGetter = (x: any) => string;

export class KeyedArray<T> {

  public getKey: KeyGetter;

  constructor(keyGetter: KeyGetter) {
    this.getKey = keyGetter;
  }

  static withKey(key: string): any {
    return new KeyedArray((x: any) => x[key]);
  }

  public get<T>(array: T[], key: string): T {
    const { getKey } = this;
    return SimpleArray.find(array, (x) => getKey(x) === key);
  }

  public checkValid<T>(array: T[], what?: string, where?: string): void {
    const { getKey } = this;

    let seen: { [k: string]: number } = {};
    for (let a of array) {
      let key = getKey(a);
      if (seen[key]) {
        throw new Error(['duplicate', what, `'${key}'`, (where ? 'in' : null), where].filter(Boolean).join(' '));
      }
      seen[key] = 1;
    }
  }

  public isValid<T>(array: T[]): boolean {
    const { getKey } = this;

    let seen: { [k: string]: number } = {};
    for (let a of array) {
      let key = getKey(a);
      if (seen[key]) return false;
      seen[key] = 1;
    }
    return true;
  }

  public overrideByKey<T>(things: T[], thingOverride: T): T[] {
    const { getKey } = this;

    let overrideKey = getKey(thingOverride);
    let added = false;
    things = things.map(t => {
      if (getKey(t) === overrideKey) {
        added = true;
        return thingOverride;
      } else {
        return t;
      }
    });
    if (!added) things.push(thingOverride);
    return things;
  }

  public overridesByKey<T>(things: T[], thingOverrides: T[]): T[] {
    const { getKey } = this;

    let keyToIndex: Record<string, number> = {};
    const thingsLength = things.length;
    for (let i = 0; i < thingsLength; i++) {
      keyToIndex[getKey(things[i])] = i;
    }

    let newThings = things.slice();
    for (let thingOverride of thingOverrides) {
      const key = getKey(thingOverride);
      if (hasOwnProp(keyToIndex, key)) {
        newThings[keyToIndex[key]] = thingOverride;
      } else {
        newThings.push(thingOverride);
      }
    }
    return newThings;
  }

  public deleteByKey<T>(array: T[], key: string): T[] {
    const { getKey } = this;
    return array.filter((a) => getKey(a) !== key);
  }
}

