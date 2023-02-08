import { PluginObj } from '@babel/core';
import { getStableKey, getStableValue } from './stableString';
import {
  hasStringLiteralArguments,
  hasStringLiteralJSXAttribute,
  isSvgElementAttribute
} from './visitorChecks';
import { NodePath } from 'ast-types';
import htmlAttributes from 'react-html-attributes';
import { getAstConfig } from './config';
import { log } from './log';

let keyMaxLength = 40;
let phrases: string[] = [];
let i18nMap = {};

const addPhrase = (displayText: string, keyText?: string) => {
  const key = getStableKey(keyText ? keyText: displayText, keyMaxLength);
  const value = getStableValue(displayText);

  if (!key || !value) {
    return null;
  }

  i18nMap[key] = value;
  phrases = [
    ...phrases,
    value,
  ];

  return { key, value };
};

function BabelPluginI18n(): PluginObj {
  return {
    name: 'i18n',
    visitor: {
      JSXAttribute(path) {
        const { node } = path;

        if (hasStringLiteralJSXAttribute(path) && !isSvgElementAttribute(path)) {
          addPhrase(node.value.value);
        }
      },
      JSXElement(path) {
        const { node } = path;
        const jsxContentNodes =  node.children;
        extractArguments(jsxContentNodes)
          .forEach(({textWithArgs, textWithoutArgs}) =>
            addPhrase(textWithArgs, textWithoutArgs));

      },
      JSXExpressionContainer(path) {
        const { node } = path;

        if (path.parent.name?.name) {
          const { blackListJsxAttributeName } = getAstConfig();
          if (blackListJsxAttributeName.includes(path.parent.name.name)) {
            log('Avoid JSX Attribute', path.parent.name.name)
            return;
          }
        } else {
          log('path.parent.name', path.parent.name)
        }

        if (node.expression.type === 'StringLiteral') {
          log('path.node.expression.value', path.node.expression.value);
          addPhrase(path.node.expression.value);
        } else if (node.expression.type === 'ConditionalExpression') {
          let expression = path.node.expression;
          if (expression.consequent.type === 'StringLiteral') {
            log('expression.consequent.value', expression.consequent.value);
            addPhrase(expression.consequent.value)
          }
          if (expression.alternate.type === 'StringLiteral') {
            log('expression.alternate.value', expression.alternate.value);
            addPhrase(expression.alternate.value);
          }
        }
      },
      CallExpression(path) {
        if (path && Array.isArray(path.container) && path.container[0]?.value) {
          const element = path.container[0].value;
          if (htmlAttributes.elements.html.includes(element) || htmlAttributes.elements.svg.includes(element)) {
            return;
          }
        }

        if (hasStringLiteralArguments(path)) {
          for (const arg of path.node.arguments) {
            if (arg.type === 'StringLiteral') {
              log('argtype string lit', arg.value);
              addPhrase(arg.value)
            }

            if (arg.type === 'ObjectExpression') {
              if (arg.properties.length === 0) {
                continue;
              }

              for (const prop of arg.properties) {
                if (prop.value && prop.value.type === 'StringLiteral') {
                  log('propvaluetype string lit', prop.value.value);
                  addPhrase(prop.value.value);
                }
              }
            }
          }
        }
      }
    }
  }
}

function extractArguments(jsxContentNodes: NodePath<any>[]) {
  let textWithArgs = '';
  let textWithoutArgs = '';
  let argIndex = 0;
  let hasText = false;
  const texts = [];
  for(let i = 0; i < jsxContentNodes.length; i++) {
    const element = jsxContentNodes[i];
    if (element.type === 'JSXText') {
      hasText = true;
      textWithArgs += element.value;
      textWithoutArgs += element.value;
    } else if (element.type === 'JSXExpressionContainer') {
      textWithArgs += `{arg${argIndex}}`;
      argIndex++;
    } else {
      if (hasText) {
        texts.push({ textWithArgs, textWithoutArgs });
        textWithArgs = '';
        textWithoutArgs = ''
      }
    }
  }
  if (hasText) {
    texts.push({ textWithArgs, textWithoutArgs });
  }
  return texts;
}

BabelPluginI18n.clear = () => {
  phrases = [];
  i18nMap = {};
};
BabelPluginI18n.setMaxKeyLength = (maxLength: number) => {
  keyMaxLength = maxLength;
};
BabelPluginI18n.getExtractedStrings = () => phrases;
BabelPluginI18n.getI18Map = () => i18nMap;

export default BabelPluginI18n;
