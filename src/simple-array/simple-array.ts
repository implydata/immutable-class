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

export type MapCallbackFn<T> = (value: T, index: number, array: T[]) => T;
export type BooleanCallbackFn<T> = (value: T, index: number, array: T[]) => boolean;

export class SimpleArray {
  static mapImmutable<T>(array: T[], fn: MapCallbackFn<T>): T[] {
    let changed = false;
    let newArray = array.map((x, i, xs) => {
      const newX = fn(x, i, xs);
      if (newX !== x) changed = true;
      return newX;
    });
    return changed ? newArray : array;
  }

  static append<T>(array: T[], value: T): T[] {
    return array.concat([value]);
  }

  static change<T>(array: T[], index: number, value: T): T[] {
    array = array.slice();
    array[index] = value;
    return array;
  }

  static find<T>(array: T[], fn: BooleanCallbackFn<T>): T {
    for (let i = 0, n = array.length; i < n; i++) {
      let a = array[i];
      if (fn.call(array, a, i)) return a;
    }
    return null;
  }

  static findIndex<T>(array: T[], fn: BooleanCallbackFn<T>): number {
    for (let i = 0, n = array.length; i < n; i++) {
      let a = array[i];
      if (fn.call(array, a, i)) return i;
    }
    return -1;
  }

  static delete<T>(array: T[], arg: T | BooleanCallbackFn<T>): T[] {
    return array.filter((a, i, arr) => typeof arg === 'function' ? !((arg as BooleanCallbackFn<T>).call(arr, a, i)) : a !== arg);
  }

  static deleteIndex<T>(array: T[], index: number): T[] {
    return array.filter((a, i) => i !== index);
  }

  static contains<T>(array: T[], arg: T | BooleanCallbackFn<T>): boolean {
    if (typeof arg !== 'function') return array.indexOf(arg) !== -1;
    return SimpleArray.findIndex(array, arg as BooleanCallbackFn<T>) !== -1;
  }

  static insertIndex<T>(array: T[], index: number, value: T): T[] {
    array = array.slice();
    array.splice(index, 0, value);
    return array;
  }

  static moveIndex<T>(array: T[], itemIndex: number, insertIndex: number): T[] {
    let n = array.length;
    if (itemIndex < 0 || itemIndex >= n) throw new Error('itemIndex out of range');
    if (insertIndex < 0 || insertIndex > n) throw new Error('insertIndex out of range');
    let newArray: T[] = [];
    array.forEach((value, i) => {
      if (i === insertIndex) newArray.push(array[itemIndex]);
      if (i !== itemIndex) newArray.push(value);
    });
    if (n === insertIndex) newArray.push(array[itemIndex]);
    return newArray;
  }

}
