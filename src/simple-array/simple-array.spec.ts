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

import { SimpleArray } from './simple-array';

describe('SimpleArray', () => {
  const someArray = ['UK', 'USA', 'Italy'];

  describe('mapImmutable', () => {
    it('something that exists', () => {
      expect(SimpleArray.mapImmutable(someArray, x => x) === someArray).toEqual(true);
    });
  });

  describe('find', () => {
    it('something that exists', () => {
      expect(SimpleArray.find(someArray, x => x.length === 3)).toEqual('USA');
    });

    it('something that does not exist', () => {
      expect(SimpleArray.find(someArray, x => x.length === 7)).toEqual(null);
    });
  });

  describe('findIndex', () => {
    it('something that exists', () => {
      expect(SimpleArray.findIndex(someArray, x => x.length === 3)).toEqual(1);
    });

    it('something that does not exist', () => {
      expect(SimpleArray.findIndex(someArray, x => x.length === 7)).toEqual(-1);
    });
  });

  describe('delete', () => {
    it('something that exists', () => {
      expect(SimpleArray.delete(someArray, 'USA')).toEqual(['UK', 'Italy']);
    });

    it('something that does not exist', () => {
      expect(SimpleArray.delete(someArray, 'Russia')).toEqual(['UK', 'USA', 'Italy']);
    });

    it('custom equals that does exist', () => {
      const array = [{ country: 'US' }, { country: 'UK' }, { country: 'Italy' }];
      expect(SimpleArray.delete(array, a => a.country === 'UK')).toEqual([
        {
          country: 'US',
        },
        {
          country: 'Italy',
        },
      ]);
    });
  });

  describe('contains', () => {
    it('something that exists', () => {
      expect(SimpleArray.contains(someArray, 'USA')).toEqual(true);
    });

    it('something that does not exist', () => {
      expect(SimpleArray.contains(someArray, 'Russia')).toEqual(false);
    });

    it('custom equals that does exist', () => {
      const array = [{ country: 'US' }, { country: 'UK' }, { country: 'Italy' }];
      expect(SimpleArray.contains(array, x => x.country === 'UK')).toEqual(true);
    });
  });

  describe('insertIndex', () => {
    it('works in simple case 0', () => {
      const list = 'ABCD'.split('');
      expect(SimpleArray.insertIndex(list, 0, 'Pre').join('')).toEqual('PreABCD');
    });
  });

  describe('moveIndex', () => {
    it('errors', () => {
      const list = 'ABCD'.split('');
      expect(() => SimpleArray.moveIndex(list, 6, 0)).toThrow('itemIndex out of range');
    });

    it('works in simple case 0', () => {
      const list = 'ABCD'.split('');
      expect(SimpleArray.moveIndex(list, 0, 0).join('')).toEqual('ABCD');
    });

    it('works in simple case 1', () => {
      const list = 'ABCD'.split('');
      expect(SimpleArray.moveIndex(list, 0, 1).join('')).toEqual('ABCD');
    });

    it('works in simple case 2', () => {
      const list = 'ABCD'.split('');
      expect(SimpleArray.moveIndex(list, 0, 2).join('')).toEqual('BACD');
    });

    it('works in simple case 3', () => {
      const list = 'ABCD'.split('');
      expect(SimpleArray.moveIndex(list, 0, 3).join('')).toEqual('BCAD');
    });

    it('works in simple case 4', () => {
      const list = 'ABCD'.split('');
      expect(SimpleArray.moveIndex(list, 0, 4).join('')).toEqual('BCDA');
    });
  });
});
