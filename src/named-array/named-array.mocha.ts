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

import { expect } from "chai";

import { NamedArray } from './named-array';

describe("NamedArray", () => {
  var someArray = [
    { name: 'UK', score: 1 },
    { name: 'USA', score: 2 },
    { name: 'Italy', score: 3 }
  ];

  describe("get", () => {
    it('something that exists', () => {
      expect(NamedArray.get(someArray, 'USA')).to.equal(someArray[1]);
    });

    it('something that does not exist', () => {
      expect(NamedArray.get(someArray, 'Russia')).to.equal(null);
    });
  });

  describe("findIndexByName", () => {
    it('something that exists', () => {
      expect(NamedArray.findIndexByName(someArray, 'USA')).to.equal(1);
    });

    it('something that does not exist', () => {
      expect(NamedArray.findIndexByName(someArray, 'Russia')).to.equal(-1);
    });
  });

  describe("overrideByName", () => {
    it('overrides (in order)', () => {
      expect(NamedArray.overrideByName(someArray, { name: 'USA', score: 5 })).to.deep.equal([
        { name: 'UK', score: 1 },
        { name: 'USA', score: 5 },
        { name: 'Italy', score: 3 }
      ]);
    });

    it('overrides appends', () => {
      expect(NamedArray.overrideByName(someArray, { name: 'Russia', score: 5 })).to.deep.equal([
        { name: 'UK', score: 1 },
        { name: 'USA', score: 2 },
        { name: 'Italy', score: 3 },
        { name: 'Russia', score: 5 }
      ]);
    });

  });

  describe("deleteByName", () => {
    it('something that exists', () => {
      expect(NamedArray.deleteByName(someArray, 'USA')).to.deep.equal([
        { name: 'UK', score: 1 },
        { name: 'Italy', score: 3 }
      ]);
    });

    it('something that does not exist', () => {
      expect(NamedArray.deleteByName(someArray, 'Russia')).to.deep.equal(someArray);
    });
  });

});
