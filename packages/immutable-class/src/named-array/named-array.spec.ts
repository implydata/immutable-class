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

import { NamedArray } from './named-array';

describe('NamedArray', () => {
  const someArray = [
    { name: 'UK', score: 1 },
    { name: 'USA', score: 2 },
    { name: 'Italy', score: 3 },
  ];

  describe('get', () => {
    it('something that exists', () => {
      expect(NamedArray.get(someArray, 'USA')).toEqual(someArray[1]);
    });

    it('something that does not exist', () => {
      expect(NamedArray.get(someArray, 'Russia')).toEqual(undefined);
    });
  });

  describe('isValid', () => {
    const invalidArr = [
      { name: 'UK', score: 1 },
      { name: 'UK', score: 2 },
      { name: 'Italy', score: 3 },
    ];

    it('invalid array', () => {
      expect(NamedArray.isValid(invalidArr)).toEqual(false);
    });

    it('valid array', () => {
      expect(NamedArray.isValid(someArray)).toEqual(true);
    });
  });

  describe('checkValid', () => {
    const invalidArr = [
      { name: 'UK', score: 1 },
      { name: 'UK', score: 2 },
      { name: 'Italy', score: 3 },
    ];

    it('invalid array', () => {
      expect(() => NamedArray.checkValid(invalidArr)).toThrow(`duplicate 'UK'`);
    });

    it('valid array', () => {
      NamedArray.checkValid(someArray);
    });
  });

  describe('containsByName', () => {
    it('something that exists', () => {
      expect(NamedArray.containsByName(someArray, 'USA')).toEqual(true);
    });

    it('something that does not exist', () => {
      expect(NamedArray.containsByName(someArray, 'Russia')).toEqual(false);
    });
  });

  describe('findIndexByName', () => {
    it('something that exists', () => {
      expect(NamedArray.findIndexByName(someArray, 'USA')).toEqual(1);
    });

    it('something that does not exist', () => {
      expect(NamedArray.findIndexByName(someArray, 'Russia')).toEqual(-1);
    });
  });

  describe('overrideByName', () => {
    it('overrides (in order)', () => {
      expect(NamedArray.overrideByName(someArray, { name: 'USA', score: 5 })).toEqual([
        { name: 'UK', score: 1 },
        { name: 'USA', score: 5 },
        { name: 'Italy', score: 3 },
      ]);
    });

    it('overrides appends', () => {
      expect(NamedArray.overrideByName(someArray, { name: 'Russia', score: 5 })).toEqual([
        { name: 'UK', score: 1 },
        { name: 'USA', score: 2 },
        { name: 'Italy', score: 3 },
        { name: 'Russia', score: 5 },
      ]);
    });
  });

  describe('overridesByName', () => {
    it('overrides (in order)', () => {
      expect(
        NamedArray.overridesByName(someArray, [
          { name: 'USA', score: 52 },
          { name: 'Italy', score: 50 },
        ]),
      ).toEqual([
        { name: 'UK', score: 1 },
        { name: 'USA', score: 52 },
        { name: 'Italy', score: 50 },
      ]);
    });

    it('overrides appends', () => {
      expect(
        NamedArray.overridesByName(someArray, [
          { name: 'Country', score: 0 },
          { name: 'Russia', score: 5 },
        ]),
      ).toEqual([
        { name: 'UK', score: 1 },
        { name: 'USA', score: 2 },
        { name: 'Italy', score: 3 },
        { name: 'Country', score: 0 },
        { name: 'Russia', score: 5 },
      ]);
    });

    it('overrides large', () => {
      const overrides = [];
      for (let i = 0; i < 40000; i++) {
        overrides.push({ name: 'Over' + i, score: i });
      }

      expect(NamedArray.overridesByName(someArray, overrides).length).toEqual(40003);
    });
  });

  describe('dedupe', () => {
    it('works', () => {
      expect(NamedArray.dedupe(someArray.concat(someArray))).toEqual(someArray);
    });
  });

  describe('deleteByName', () => {
    it('something that exists', () => {
      expect(NamedArray.deleteByName(someArray, 'USA')).toEqual([
        { name: 'UK', score: 1 },
        { name: 'Italy', score: 3 },
      ]);
    });

    it('something that does not exist', () => {
      expect(NamedArray.deleteByName(someArray, 'Russia')).toEqual(someArray);
    });
  });

  describe('findByNameCI', () => {
    it('something that exists', () => {
      expect(NamedArray.findByNameCI(someArray, 'usa')).toEqual({ name: 'USA', score: 2 });
      expect(NamedArray.findByNameCI([{ name: 'UsA', score: 2 }], 'uSa')).toEqual({
        name: 'UsA',
        score: 2,
      });
    });

    it('something that does not exist', () => {
      expect(NamedArray.findByNameCI(someArray, 'RUsSia')).toEqual(undefined);
    });
  });

  describe('#toMap', () => {
    it('works', () => {
      expect(NamedArray.toRecord(someArray)).toEqual({
        Italy: {
          name: 'Italy',
          score: 3,
        },
        UK: {
          name: 'UK',
          score: 1,
        },
        USA: {
          name: 'USA',
          score: 2,
        },
      });
    });
  });

  describe('synchronize', () => {
    function valueEqual(a: any, b: any) {
      return a.value === b.value;
    }

    it('one enter', () => {
      const ops: string[] = [];

      NamedArray.synchronize([], [{ name: 'A' }], {
        equals: valueEqual,
        onEnter: newThing => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (_newThing, oldThing) => {
          ops.push(`Update ${oldThing.name}`);
        },
        onExit: oldThing => {
          ops.push(`Exit ${oldThing.name}`);
        },
      });

      expect(ops.join('; ')).toEqual('Enter A');
    });

    it('one exit', () => {
      const ops: string[] = [];

      NamedArray.synchronize([{ name: 'A' }], [], {
        equals: valueEqual,
        onEnter: newThing => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (_newThing, oldThing) => {
          ops.push(`Update ${oldThing.name}`);
        },
        onExit: oldThing => {
          ops.push(`Exit ${oldThing.name}`);
        },
      });

      expect(ops.join('; ')).toEqual('Exit A');
    });

    it('enter / exit', () => {
      const ops: string[] = [];

      NamedArray.synchronize([{ name: 'A' }], [{ name: 'B' }], {
        equals: valueEqual,
        onEnter: newThing => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (_newThing, oldThing) => {
          ops.push(`Update ${oldThing.name}`);
        },
        onExit: oldThing => {
          ops.push(`Exit ${oldThing.name}`);
        },
      });

      expect(ops.join('; ')).toEqual('Enter B; Exit A');
    });

    it('enter / update / exit', () => {
      const ops: string[] = [];

      NamedArray.synchronize(
        [{ name: 'A', value: 1 }, { name: 'B', value: 2 }],
        [{ name: 'B', value: 3 }, { name: 'C', value: 4 }],
        {
          equals: valueEqual,
          onEnter: newThing => {
            ops.push(`Enter ${newThing.name}`);
          },
          onUpdate: (newThing, oldThing) => {
            ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
          },
          onExit: oldThing => {
            ops.push(`Exit ${oldThing.name}`);
          },
        },
      );

      expect(ops.join('; ')).toEqual('Update B 2 => 3; Enter C; Exit A');
    });
  });
});
