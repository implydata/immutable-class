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

export type CallbackFn<T> = (value: T, index: number, array: T[]) => boolean

export class SimpleArray {
  static find<T>(array: T[], fn: CallbackFn<T>): T {
    for (let i = 0, n = array.length; i < n; i++) {
      let a = array[i];
      if (fn.call(array, a, i)) return a;
    }
    return null;
  }

  static findIndex<T>(array: T[], fn: CallbackFn<T>): number {
    for (let i = 0, n = array.length; i < n; i++) {
      let a = array[i];
      if (fn.call(array, a, i)) return i;
    }
    return -1;
  }

  static delete<T>(array: T[], arg: T | CallbackFn<T>): T[] {
    return array.filter((a, i, arr) => typeof arg === 'function' ? !((arg as CallbackFn<T>).call(arr, a, i)) : a !== arg);
  }

  static contains<T>(array: T[], arg: T | CallbackFn<T>): boolean {
    if (typeof arg !== 'function') return array.indexOf(arg) !== -1;
    return SimpleArray.findIndex(array, arg as CallbackFn<T>) !== -1;
  }

}
