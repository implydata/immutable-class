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

export interface Equalable {
  equals(other: any): boolean;
}

/**
 * Checks if two things (that might be immutable) are equal (if both null it counts as yes)
 * @param a - thing to compare
 * @param b - thing to compare
 * @returns {boolean}
 */
export function generalEqual<T>(a: T | undefined, b: T | undefined): boolean {
  if (a === b) return true;
  if (a && b) {
    if (
      typeof (a as any).toISOString === 'function' &&
      typeof (b as any).toISOString === 'function'
    ) {
      return (a as any).valueOf() === (b as any).valueOf();
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return generalArraysEqual(a as any, b as any);
    }
    if (typeof (a as any).equals === 'function') {
      return (a as any).equals(b);
    }
  }
  return false;
}

/**
 * Checks if two immutable classes are equal (if both null it counts as yes)
 * @param a - thing to compare
 * @param b - thing to compare
 * @returns {boolean}
 */
export function immutableEqual<T extends Equalable>(a: T | undefined, b: T | undefined): boolean {
  if (a === b) return true;
  if (!a) return false;
  return a.equals(b);
}

/**
 * Checks if two arrays are equal in general
 * @param arrayA - array to compare
 * @param arrayB - array to compare
 * @returns {boolean}
 */
export function generalArraysEqual<T>(arrayA: T[] | undefined, arrayB: T[] | undefined): boolean {
  if (arrayA === arrayB) return true;
  if (!arrayA || !arrayB) return false;
  const length = arrayA.length;
  if (length !== arrayB.length) return false;
  for (let i = 0; i < length; i++) {
    if (!generalEqual<T>(arrayA[i], arrayB[i])) return false;
  }
  return true;
}

/**
 * Checks if two arrays have equal immutable classes
 * @param arrayA - array to compare
 * @param arrayB - array to compare
 * @returns {boolean}
 */
export function immutableArraysEqual<T extends Equalable>(
  arrayA: T[] | undefined,
  arrayB: T[] | undefined,
): boolean {
  if (arrayA === arrayB) return true;
  if (!arrayA || !arrayB) return false;
  const length = arrayA.length;
  if (length !== arrayB.length) return false;
  for (let i = 0; i < length; i++) {
    if (!immutableEqual(arrayA[i], arrayB[i])) return false;
  }
  return true;
}

/**
 * Checks if two lookups have general equality
 * @param lookupA - lookup to compare
 * @param lookupB - lookup to compare
 * @returns {boolean}
 */
export function generalLookupsEqual<T>(
  lookupA: Record<string, T> | undefined,
  lookupB: Record<string, T> | undefined,
): boolean {
  if (lookupA === lookupB) return true;
  if (!lookupA || !lookupB) return false;
  const keysA = Object.keys(lookupA);
  const keysB = Object.keys(lookupB);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!generalEqual<T>(lookupA[k], lookupB[k])) return false;
  }
  return true;
}

/**
 * Checks if two lookups have equal immutable classes
 * @param lookupA - lookup to compare
 * @param lookupB - lookup to compare
 * @returns {boolean}
 */
export function immutableLookupsEqual<T extends Equalable>(
  lookupA: Record<string, T> | undefined,
  lookupB: Record<string, T> | undefined,
): boolean {
  if (lookupA === lookupB) return true;
  if (!lookupA || !lookupB) return false;
  const keysA = Object.keys(lookupA);
  const keysB = Object.keys(lookupB);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!immutableEqual(lookupA[k], lookupB[k])) return false;
  }
  return true;
}
