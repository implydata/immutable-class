# Immutable Class ESLint Plugins

An ESLint plugin with various rules for enforcing `immutable-class` requirements.

## Usage

```shell
$ npm i -D eslint-plugin-immutable-class @typescript-eslint/parser
```

`.eslintrc`:

```json
{
  "plugins": ["immutable-class"],
  "extends": "plugin:immutable-class/recommended",
  "parser": "@typescript-eslint/parser"
}
```

## Rules

**Key**: :white_check_mark: = recommended, :wrench: = fixable

| Rule                                                                                  | Description                                                                | :white_check_mark: | :wrench: |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------ | -------- |
| [`immutable-class/declare-implicit-fields`](./src/rules/declare-implicit-fields.md)   | Ensure that implicit Immutable Class properties are defined with `declare` | :white_check_mark: | :wrench: |
| [`immutable-class/readonly-implicit-fields`](./src/rules/readonly-implicit-fields.md) | Ensure that implicit Immutable Class properties use `readonly`             | :white_check_mark: | :wrench: |
