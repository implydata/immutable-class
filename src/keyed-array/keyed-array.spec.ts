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

import { KeyedArray } from './keyed-array';

describe('KeyedArray', () => {
  const someArray = [
    { accountId: 'UK', score: 1 },
    { accountId: 'USA', score: 2 },
    { accountId: 'Italy', score: 3 },
  ];

  const keyedHelper = KeyedArray.withKey('accountId');

  describe('get', () => {
    it('something that exists', () => {
      expect(keyedHelper.get(someArray, 'USA')).toEqual(someArray[1]);
    });

    it('something that does not exist', () => {
      expect(keyedHelper.get(someArray, 'Russia')).toEqual(undefined);
    });
  });

  describe('overrideByKey', () => {
    it('overrides (in order)', () => {
      expect(keyedHelper.overrideByKey(someArray, { accountId: 'USA', score: 5 })).toEqual([
        { accountId: 'UK', score: 1 },
        { accountId: 'USA', score: 5 },
        { accountId: 'Italy', score: 3 },
      ]);
    });

    it('overrides appends', () => {
      expect(keyedHelper.overrideByKey(someArray, { accountId: 'Russia', score: 5 })).toEqual([
        { accountId: 'UK', score: 1 },
        { accountId: 'USA', score: 2 },
        { accountId: 'Italy', score: 3 },
        { accountId: 'Russia', score: 5 },
      ]);
    });
  });

  describe('deleteByName', () => {
    it('something that exists', () => {
      expect(keyedHelper.deleteByKey(someArray, 'USA')).toEqual([
        { accountId: 'UK', score: 1 },
        { accountId: 'Italy', score: 3 },
      ]);
    });

    it('something that does not exist', () => {
      expect(keyedHelper.deleteByKey(someArray, 'Russia')).toEqual(someArray);
    });
  });
});
