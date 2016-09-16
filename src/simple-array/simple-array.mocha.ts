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

import { SimpleArray } from './simple-array';

describe("SimpleArray", () => {
  var someArray = [
    'UK',
    'USA',
    'Italy'
  ];

  describe("find", () => {
    it('something that exists', () => {
      expect(SimpleArray.find(someArray, (x) => x.length === 3)).to.equal('USA');
    });

    it('something that does not exist', () => {
      expect(SimpleArray.find(someArray, (x) => x.length === 7)).to.equal(null);
    });
  });

  describe("findIndex", () => {
    it('something that exists', () => {
      expect(SimpleArray.findIndex(someArray, (x) => x.length === 3)).to.equal(1);
    });

    it('something that does not exist', () => {
      expect(SimpleArray.findIndex(someArray, (x) => x.length === 7)).to.equal(-1);
    });
  });

  describe("delete", () => {
    it('something that exists', () => {
      expect(SimpleArray.delete(someArray, 'USA')).to.deep.equal([ 'UK', 'Italy' ]);
    });

    it('something that does not exist', () => {
      expect(SimpleArray.delete(someArray, 'Russia')).to.deep.equal([ 'UK', 'USA', 'Italy' ]);
    });

    it('custom equals that does exist', () => {
      var array = [{'country': 'US'}, {'country': 'UK'}, {'country': 'Italy'}];
      expect(SimpleArray.delete(array, (a) => a.country === 'UK')).to.deep.equal(
        [
          {
            "country": "US"
          },
          {
            "country": "Italy"
          }
        ]
      );
    });
  });

  describe("contains", () => {
    it('something that exists', () => {
      expect(SimpleArray.contains(someArray, 'USA')).to.equal(true);
    });

    it('something that does not exist', () => {
      expect(SimpleArray.contains(someArray, 'Russia')).to.equal(false);
    });

    it('custom equals that does exist', () => {
      var array = [{'country': 'US'}, {'country': 'UK'}, {'country': 'Italy'}];
      expect(SimpleArray.contains(array, (x) => x.country === 'UK')).to.deep.equal(true);
    });
  });

});
