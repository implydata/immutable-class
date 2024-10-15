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

import { ASTUtils, ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  name =>
    `https://github.com/implydata/immutable-class/blob/master/packages/eslint-plugin-immutable-class/src/rules/${name}.md`,
);

const isClassBody = ASTUtils.isNodeOfType(TSESTree.AST_NODE_TYPES.ClassBody);
const isClassExpression = ASTUtils.isNodeOfType(TSESTree.AST_NODE_TYPES.ClassExpression);
const isIdentifier = ASTUtils.isNodeOfType(TSESTree.AST_NODE_TYPES.Identifier);
const isTSFunctionType = ASTUtils.isNodeOfType(TSESTree.AST_NODE_TYPES.TSFunctionType);

export const readonlyImplicitFields = createRule({
  name: 'readonly-implicit-fields',
  create(context) {
    return {
      PropertyDefinition(node) {
        // Look for the containing class declaration
        const body = isClassBody(node.parent) ? node.parent : null;

        let cls = body?.parent;
        while (cls && isClassExpression(cls.parent)) {
          cls = cls.parent;
        }

        // Ensure the class is an Immutable class (derived from BaseImmutable)
        if (!cls?.superClass) return;
        if (!isIdentifier(cls.superClass)) return;
        if (cls.superClass.name !== 'BaseImmutable') return;

        const invalid =
          node.declare && // Using 'declare'
          !node.readonly && // Not readonly
          !node.static; // Not static

        if (invalid) {
          const messageId = isTSFunctionType(node.typeAnnotation?.typeAnnotation)
            ? 'useReadonlyForAccessor'
            : 'useReadonlyForProperty';

          context.report({
            messageId,
            node,
            *fix(fixer) {
              // Insert 'readonly'
              yield fixer.insertTextBefore(node.key, 'readonly ');
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Ensure that implicit ImmutableClass properties and methods are readonly',
    },
    messages: {
      useReadonlyForProperty: 'Immutable class properties should be readonly',
      useReadonlyForAccessor: 'Immutable class accessors should be readonly',
    },
    fixable: 'code',
    type: 'problem',
    schema: [],
  },
});
