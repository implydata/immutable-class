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

// Deprecated
export function isInstanceOf(thing: any, constructor: any): boolean {
  console.warn(`isInstanceOf is deprecated, use native instanceof instead`);
  if (typeof constructor !== 'function') throw new TypeError("constructor must be a function");
  if (thing instanceof constructor) return true;
  if (thing == null) return false;
  var constructorName: string = constructor.name;
  if (!constructorName) return false;
  var thingProto: any = thing.__proto__;
  while (thingProto && thingProto.constructor) {
    if (thingProto.constructor.name === constructorName) return true;
    thingProto = thingProto.__proto__;
  }
  return false;
}

/**
 * Check to see if things are an array of instances of the given constructor
 * Uses instanceof internally
 * @param things - the array of things to test
 * @param constructor - the constructor class to check against
 * @returns {boolean}
 */
export function isArrayOf(things: any[], constructor: any): boolean {
  if (!Array.isArray(things)) return false;
  for (var i = 0, length = things.length; i < length; i++) {
    if (!(things[i] instanceof constructor)) return false;
  }
  return true;
}

/**
 * Does a quick 'duck typing' test to see if the given parameter is an immutable class
 * @param thing - the thing to test
 * @returns {boolean}
 */
export function isImmutableClass(thing: any): boolean {
  if (!thing || typeof thing !== 'object') return false;
  var ClassFn = thing.constructor;
  return typeof ClassFn.fromJS === 'function' && // Has Class.fromJS
    typeof thing.toJS === 'function' && // Has Class#toJS
    typeof thing.equals === 'function'; // Has Class#equals
}
