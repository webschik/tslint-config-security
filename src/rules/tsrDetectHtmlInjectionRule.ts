import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringLiteralKinds} from '../node-kind';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

const unsafeDocumentHtmlMethods: string[] = ['writeln', 'write'];
const unsafeElementHtmlMethods: string[] = ['insertAdjacentHTML'];
const unsafeElementHtmlProps: string[] = ['outerHTML', 'innerHTML'];

function walk(ctx: Lint.WalkContext<void>) {
    function visitNode(node: ts.Node): void {
        switch (node.kind) {
            case ts.SyntaxKind.PropertyAccessExpression: {
                const {expression, name} = node as ts.PropertyAccessExpression;
                const parent: ts.CallExpression = node.parent as ts.CallExpression;
                const firstArgument: undefined | ts.Expression = parent && parent.arguments && parent.arguments[0];

                if (expression && name && firstArgument && !stringLiteralKinds.includes(firstArgument.kind)) {
                    const method: string = name.text;

                    if (
                        (expression as ts.Identifier).text === 'document' &&
                        unsafeDocumentHtmlMethods.includes(method)
                    ) {
                        ctx.addFailureAtNode(parent, `Found document.${method} with non-literal argument`);
                    } else if (unsafeElementHtmlMethods.includes(method)) {
                        ctx.addFailureAtNode(parent, `Found Element.${method} with non-literal argument`);
                    }
                }

                break;
            }
            case ts.SyntaxKind.BinaryExpression: {
                const {left, right, operatorToken} = node as ts.BinaryExpression;
                const leftName: ts.Identifier | undefined = left && (left as ts.PropertyAccessExpression).name;

                if (
                    operatorToken &&
                    operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                    left &&
                    left.kind === ts.SyntaxKind.PropertyAccessExpression &&
                    leftName &&
                    right &&
                    !stringLiteralKinds.includes(right.kind) &&
                    unsafeElementHtmlProps.includes(leftName.text)
                ) {
                    ctx.addFailureAtNode(node, `Found Element.${leftName.text} with non-literal value`);
                }

                break;
            }
            default:
            //
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
