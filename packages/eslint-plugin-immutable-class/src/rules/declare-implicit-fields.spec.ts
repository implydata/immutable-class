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

import { declareImplicitFields } from './declare-implicit-fields';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('declare-implicit-fields', declareImplicitFields, {
  valid: [
    // Various valid cases inside of Immutable Classes
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      public declare foo: string;
      private readonly baz: number;
      public readonly qux: () => void;
      public getBaz = () => this.baz;
      public changeBaz = (baz: number) => this;
      public doStuff(): string { return 'stuff'; }
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      readonly foo: string;
      public readonly foo: string;
      private readonly foo: string;
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      readonly getFoo: () => string;
      public readonly getFoo: () => string;
      private readonly getFoo: () => string;
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      readonly changeFoo: (foo: string) => MyClass;
      public readonly changeFoo: (foo: string) => MyClass;
      private readonly changeFoo: (foo: string) => MyClass;
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      foo: string = 'foo';
      public foo: string = 'foo';
      private foo: string = 'foo';
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      foo!: string = 'foo';
      public foo!: string = 'foo';
      private foo!: string = 'foo';
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      foo! = 'foo';
      public foo! = 'foo';
      private foo! = 'foo';
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      foo!: () => string = () => 'foo';
      public foo!: () => string = () => 'foo';
      private foo!: () => string = () => 'foo';
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      foo! = () => 'foo';
      public foo! = () => 'foo';
      private foo! = () => 'foo';
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      changeFoo!: (foo: string) => MyClass = (foo) => this;
      public changeFoo!: (foo: string) => MyClass = (foo) => this;
      private changeFoo!: (foo: string) => MyClass = (foo) => this;
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      changeFoo! = (foo: string) => this;
      public changeFoo! = (foo: string) => this;
      private changeFoo! = (foo: string) => this;
    }`,
    `class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
      declare readonly foo: string;
      public declare readonly foo: string;
      private declare readonly foo: string;
    }`,

    // Invalid cases but not inside of BaseImmutable inheritors
    `class MyClass extends NotImmutable {
      public foo!: string;
    }`,
    `class MyClass extends NotImmutable {
      public foo: string;
    }`,
    `class MyClass extends NotImmutable {
      foo!: string;
    }`,
    `class MyClass extends NotImmutable {
      foo: string;
    }`,
    `class MyClass extends NotImmutable {
      private foo!: string;
    }`,
    `class MyClass extends NotImmutable {
      private foo: string;
    }`,
    `class MyClass extends NotImmutable {
      public getFoo!: () => string;
    }`,
    `class MyClass extends NotImmutable {
      public getFoo: () => string;
    }`,
    `class MyClass extends NotImmutable {
      getFoo!: () => string;
    }`,
    `class MyClass extends NotImmutable {
      getFoo: () => string;
    }`,
    `class MyClass extends NotImmutable {
      private getFoo!: () => string;
    }`,
    `class MyClass extends NotImmutable {
      private getFoo: () => string;
    }`,
    `class MyClass extends NotImmutable {
      public changeFoo!: (foo: string) => MyClass;
    }`,
    `class MyClass extends NotImmutable {
      public changeFoo: (foo: string) => MyClass;
    }`,
  ],
  invalid: [
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public foo!: string;
          bar: string;
          getBaz!: () => MyClass;
          changeBaz: (baz: number) => MyClass;
          public declare qux: string;
          public getQux(): string;
          public fleep!: string = 'fleep';
        }`,
      errors: [
        { messageId: 'useDeclareForProperty', line: 3, column: 11 },
        { messageId: 'useDeclareForProperty', line: 4, column: 11 },
        { messageId: 'useDeclareForAccessor', line: 5, column: 11 },
        { messageId: 'useDeclareForAccessor', line: 6, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare foo: string;
          declare bar: string;
          declare getBaz: () => MyClass;
          declare changeBaz: (baz: number) => MyClass;
          public declare qux: string;
          public getQux(): string;
          public fleep!: string = 'fleep';
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public foo!: string;
          public bar: string;
        }`,
      errors: [
        { messageId: 'useDeclareForProperty', line: 3, column: 11 },
        { messageId: 'useDeclareForProperty', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare foo: string;
          public declare bar: string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          foo!: string;
          bar: string;
        }`,
      errors: [
        { messageId: 'useDeclareForProperty', line: 3, column: 11 },
        { messageId: 'useDeclareForProperty', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          declare foo: string;
          declare bar: string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private foo!: string;
          private bar: string;
        }`,
      errors: [
        { messageId: 'useDeclareForProperty', line: 3, column: 11 },
        { messageId: 'useDeclareForProperty', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private declare foo: string;
          private declare bar: string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public getFoo!: () => string;
          public getBar: () => string;
        }`,
      errors: [
        { messageId: 'useDeclareForAccessor', line: 3, column: 11 },
        { messageId: 'useDeclareForAccessor', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare getFoo: () => string;
          public declare getBar: () => string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          getFoo!: () => string;
          getBar: () => string;
        }`,
      errors: [
        { messageId: 'useDeclareForAccessor', line: 3, column: 11 },
        { messageId: 'useDeclareForAccessor', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          declare getFoo: () => string;
          declare getBar: () => string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private getFoo!: () => string;
          private getBar: () => string;
        }`,
      errors: [
        { messageId: 'useDeclareForAccessor', line: 3, column: 11 },
        { messageId: 'useDeclareForAccessor', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          private declare getFoo: () => string;
          private declare getBar: () => string;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public changeFoo!: (foo: string) => MyClass;
          public changeBar: (bar: string) => MyClass;
        }`,
      errors: [
        { messageId: 'useDeclareForAccessor', line: 3, column: 11 },
        { messageId: 'useDeclareForAccessor', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare changeFoo: (foo: string) => MyClass;
          public declare changeBar: (bar: string) => MyClass;
        }`,
    },
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public readonly foo!: string;
          public readonly bar?: number;
        }`,
      errors: [
        { messageId: 'useDeclareForProperty', line: 3, column: 11 },
        { messageId: 'useDeclareForProperty', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public declare readonly foo: string;
          public declare readonly bar?: number;
        }`,
    },

    // Weird spacing
    {
      code: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public     foo      !    : string;
          public   bar

            : string;
        }`,
      errors: [
        { messageId: 'useDeclareForProperty', line: 3, column: 11 },
        { messageId: 'useDeclareForProperty', line: 4, column: 11 },
      ],
      output: `
        class MyClass extends BaseImmutable<MyClassValue, MyClassJS> {
          public     declare foo          : string;
          public   declare bar

            : string;
        }`,
    },
  ],
});
