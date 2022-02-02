/*
 * Copyright 2022 Imply Data, Inc.
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

import { ESLintUtils } from '@typescript-eslint/utils';

import { readonlyImplicitFields } from './readonly-implicit-fields';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('readonly-implicit-fields', readonlyImplicitFields, {
  valid: [
    // Various valid cases inside of Immutable Classes
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      public declare readonly foo: string;
      private readonly baz: number;
      public readonly qux: () => void;
      public getBaz = () => this.baz;
      public changeBaz = (baz: number) => this;
      public doStuff(): string { return 'stuff'; }
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      declare readonly foo: string;
      public declare readonly foo: string;
      private declare readonly foo: string;
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      declare readonly getFoo: () => string;
      public declare readonly getFoo: () => string;
      private declare readonly getFoo: () => string;
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      declare readonly changeFoo: (foo: string) => MyClass;
      public declare readonly changeFoo: (foo: string) => MyClass;
      private declare readonly changeFoo: (foo: string) => MyClass;
    }`,

    // Invalid cases but not inside of BaseImmutable inheritors
    `class MyClass extends NotImmutable {
      declare foo: string;
    }`,
    `class MyClass extends NotImmutable {
      public declare foo: string;
    }`,
    `class MyClass extends NotImmutable {
      private declare foo: string;
    }`,
  ],
  invalid: [
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare foo: string;
        }`,
      errors: [{ messageId: 'useReadonlyForProperty', line: 3, column: 11 }],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare readonly foo: string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          declare foo: string;
        }`,
      errors: [{ messageId: 'useReadonlyForProperty', line: 3, column: 11 }],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          declare readonly foo: string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private declare foo: string;
        }`,
      errors: [{ messageId: 'useReadonlyForProperty', line: 3, column: 11 }],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private declare readonly foo: string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare getFoo: () => string;
        }`,
      errors: [{ messageId: 'useReadonlyForAccessor', line: 3, column: 11 }],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare readonly getFoo: () => string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          declare getFoo: () => string;
        }`,
      errors: [{ messageId: 'useReadonlyForAccessor', line: 3, column: 11 }],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          declare readonly getFoo: () => string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private declare getFoo: () => string;
        }`,
      errors: [{ messageId: 'useReadonlyForAccessor', line: 3, column: 11 }],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private declare readonly getFoo: () => string;
        }`,
    },

    // Weird spacing
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public
            declare foo          : string;
        }`,
      errors: [{ messageId: 'useReadonlyForProperty', line: 4, column: 13 }],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public
            declare readonly foo          : string;
        }`,
    },
  ],
});
