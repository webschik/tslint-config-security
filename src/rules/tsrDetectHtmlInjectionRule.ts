import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringLiteralKinds} from '../node-kind';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

const unsafeDocumentHtmlMethods: string[] = ['writeln', 'write'];
const unsafeElementHtmlMethods: string[] = ['insertAdjacentHTML'];
const unsafeElementHtmlProps: string[] = ['outerHTML', 'innerHTML'];

class RuleWalker extends Lint.RuleWalker {
    visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        const expression: ts.Identifier = node.expression as ts.Identifier;
        const name: ts.Identifier = node.name;
        const parent: ts.CallExpression = node.parent as ts.CallExpression;
        const firstArgument: undefined | ts.Expression = parent && parent.arguments && parent.arguments[0];

        if (expression && name && firstArgument && !stringLiteralKinds.includes(firstArgument.kind)) {
            const method: string = name.text;

            if (expression.text === 'document' && unsafeDocumentHtmlMethods.includes(method)) {
                this.addFailureAtNode(parent, `Found document.${method} with non-literal argument`);
            } else if (unsafeElementHtmlMethods.includes(method)) {
                this.addFailureAtNode(parent, `Found Element.${method} with non-literal argument`);
            }
        }

        super.visitPropertyAccessExpression(node);
    }

    visitBinaryExpression(node: ts.BinaryExpression) {
        const left: ts.PropertyAccessExpression = node.left as ts.PropertyAccessExpression;
        const right: ts.Expression = node.right;

        if (
            node.operatorToken &&
            node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            left &&
            left.kind === ts.SyntaxKind.PropertyAccessExpression &&
            left.name &&
            right &&
            !stringLiteralKinds.includes(right.kind) &&
            unsafeElementHtmlProps.includes(left.name.text)
        ) {
            this.addFailureAtNode(node, `Found Element.${left.name.text} with non-literal value`);
        }

        super.visitBinaryExpression(node);
    }
}
