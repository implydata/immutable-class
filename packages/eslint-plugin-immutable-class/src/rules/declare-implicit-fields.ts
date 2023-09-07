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

import { AST_NODE_TYPES, AST_TOKEN_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  name =>
    `https://github.com/implydata/immutable-class/blob/master/packages/eslint-plugin-immutable-class/src/rules/${name}.md`,
);

export const declareImplicitFields = createRule({
  name: 'declare-implicit-fields',
  create(context) {
    return {
      PropertyDefinition(node) {
        // Look for the containing class declaration
        let cls = node.parent;
        while (cls && cls.type !== AST_NODE_TYPES.ClassDeclaration) {
          cls = cls.parent!;
        }

        // Ensure the class is an Immutable class (derived from BaseImmutable)
        if (!cls?.superClass) return;
        if (cls.superClass.type !== AST_NODE_TYPES.Identifier) return;
        if (cls.superClass.name !== 'BaseImmutable') return;

        const invalid =
          !node.value && // Does not have a value assignment (implicit field)
          !node.declare && // Not already using 'declare'
          !node.static && // Not static
          (!node.readonly || node.definite || node.optional); // If readonly, must be definite or optional

        if (invalid) {
          const messageId =
            node.typeAnnotation?.typeAnnotation?.type === AST_NODE_TYPES.TSFunctionType
              ? 'useDeclareForAccessor'
              : 'useDeclareForProperty';

          context.report({
            messageId,
            node,
            *fix(fixer) {
              if (node.definite) {
                const source = context.getSourceCode();

                // Remove the '!' if it's there
                const definite = source
                  .getTokens(node)
                  .find(t => t.type === AST_TOKEN_TYPES.Punctuator && t.value === '!');
                if (definite) yield fixer.remove(definite);
              }

              // Insert 'declare'
              if (node.readonly) {
                // Insert it before the 'readonly' token if it's present
                const source = context.getSourceCode();
                const readonly = source
                  .getTokens(node)
                  .find(t => t.type === AST_TOKEN_TYPES.Identifier && t.value === 'readonly');
                if (readonly) yield fixer.insertTextBefore(readonly, 'declare ');
              } else {
                // Otherwise, insert it before the property name
                yield fixer.insertTextBefore(node.key, 'declare ');
              }
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Ensure that implicit ImmutableClass properties and methods are defined with "declare"',
      recommended: 'recommended',
    },
    messages: {
      useDeclareForProperty: 'Use "declare" for immutable class properties',
      useDeclareForAccessor: 'Use "declare" for implicit immutable class accessors',
    },
    fixable: 'code',
    type: 'problem',
    schema: [],
  },
});
