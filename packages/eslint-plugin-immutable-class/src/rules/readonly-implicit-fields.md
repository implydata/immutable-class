# Ensure that implicit ImmutableClass properties and accessors are readonly (`readonly-implicit-fields`)

## Rule details

This rule ensures that immutable class properties and accessors that are implicitly defined by `BaseImmutable` are defined as `readonly`.

### ❌ Incorrect

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

### ✅ Correct

```ts
class MyClass extends BaseImmutable<MyValue, MyJS> {
  declare readonly propOne: string;
  public declare readonly propTwo: number;
  propThree = new Date();

  constructor(value: MyValue) {
    super(value);
  }

  public declare readonly getPropOne: () => string;
  public declare readonly changePropOne: (propOne: string) => MyClass;

  declare readonly getPropTwo: () => number;
  changePropTwo = (propTwo: number) => this.change('propTwo', propTwo || 2);
}
BaseImmutable.finalize(MyClass);
```

### Configuring

```jsonc
{
  "rules": {
    "immutable-class/readonly-implicit-fields": ["error"]
  }
}
```
