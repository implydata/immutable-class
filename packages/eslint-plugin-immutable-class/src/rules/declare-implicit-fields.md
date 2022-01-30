# Ensure that implicit ImmutableClass properties and accessors are defined with `declare` (`explicit-module-boundary-types`)

## Rule details

This rule ensures that immutable class properties and accessors that are implicitly defined by `BaseImmutable` will behave as expected for all compiler options and transpilers.

### ❌ Incorrect

```ts
class MyClass extends BaseImmutable<MyValue, MyJS> {
  propOne: string;
  public propTwo!: number;
  propThree = new Date();

  constructor(value: MyValue) {
    super(value);
  }

  public getPropOne: () => string;
  public changePropOne: (propOne: string) => MyClass;

  getPropTwo: () => number;
  changePropTwo = (propTwo: number) => this.change('propTwo', propTwo || 2);
}
BaseImmutable.finalize(MyClass);
```

### ✅ Correct

```ts
class MyClass extends BaseImmutable<MyValue, MyJS> {
  declare propOne: string;
  public declare propTwo: number;
  propThree = new Date();

  constructor(value: MyValue) {
    super(value);
  }

  public declare getPropOne: () => string;
  public declare changePropOne: (propOne: string) => MyClass;

  declare getPropTwo: () => number;
  changePropTwo = (propTwo: number) => this.change('propTwo', propTwo || 2);
}
BaseImmutable.finalize(MyClass);
```

### Configuring

```jsonc
{
  "rules": {
    "immutable-class/declare-implicit-fields": ["error"]
  }
}
```

## History

Using `declare` will instruct the TypeScript compiler not to emit any runtime code for fields that are defined implicitly by the `BaseImmutable` constructor.

With some TS compiler options or when using alternate transpilers (e.g., [SWC](https://swc.rs/)), property definitions that appear to be type-only may still affect the runtime output. Consider the case of the `"useDefineForClassFields"` compiler option. With the default value (`false`), runtime code is generated similar to the following:

`useDefineForClassFields: false`:

```ts
// input.ts
class MyClass extends BaseImmutable<MyValue, MyJS> {
  propOne: string;

  constructor(value: MyValue) {
    super(value);
  }

  changePropOne: (propOne: string) => MyClass;
  getPropOne = () => this.propOne || 'one';
}
BaseImmutable.finalize(MyClass);

// output.js
class MyClass extends BaseImmutable {
  constructor(value) {
    super(value);
    this.getPropOne = () => this.propOne || 'one';
  }
}
BaseImmutable.finalize(MyClass);
```

Since neither `propOne` nor `changePropOne` have assigned values during construction, they are simply omitted from the runtime JS for the class. This is how the TypeScript team [thought class fields would work](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier) when they first implemented classes, but public class fields will most likely be standardized differently in ES2022.

When the TS target is `ES2022` or with `"useDefineForClassFields": true`, this is how the JS is emitted:

`useDefineForClassFields: true`:

```js
// output.js
class MyClass extends BaseImmutable {
  constructor(value) {
    super(value);
    Object.defineProperty(this, 'propOne', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, 'changePropOne', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, 'getPropOne', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: () => this.propOne || 'one',
    });
  }
}
BaseImmutable.finalize(MyClass);
```

This presents a problem for immtuable-class because the implicit properties (`propOne`) are defined in the `BaseImmutable` constructor (`super(value)`) and the implicit accessors (`changePropOne`) are defined in the finalizer (`BaseImmutable.finalize`). But in both cases, _they will be overwritten in the `MyClass` constructor_.

This means that any implicit property or accessor will be undefined at runtime, simply by telling TypeScript that they exist.

The solution to this, [recommended by the TS team](https://www.typescriptlang.org/docs/handbook/2/classes.html#type-only-field-declarations) is to use `declare` for type-only field declarations.

`useDefineForClassFields: true`:

```ts
// input.ts
class MyClass extends BaseImmutable<MyValue, MyJS> {
  declare propOne: string;

  constructor(value: MyValue) {
    super(value);
  }

  declare changePropOne: (propOne: string) => MyClass;
  getPropOne = () => this.propOne || 'one';
}
BaseImmutable.finalize(MyClass);

// output.js
class MyClass extends BaseImmutable {
  constructor(value) {
    super(value);
    Object.defineProperty(this, 'getPropOne', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: () => this.propOne || 'one',
    });
  }
}
BaseImmutable.finalize(MyClass);
```

As you can see, `declare` instructs the compiler not to emit any runtime code for those fields, which maintains compatibility with `BaseImmutable`.
