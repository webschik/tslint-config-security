import * as Lint from 'tslint';
import * as ts from 'typescript';
import fsModuleMethodsArgumentsInfo from '../fs-module-methods-arguments-info';
import {stringLiteralKinds} from '../node-kind';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

const expressionsToCheck: string[] = ['fs', `require('fs')`, 'require("fs")', 'require(`fs`)'];
const reservedIdentifiers: string[] = ['__dirname'];

class RuleWalker extends Lint.RuleWalker {
    visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        const {name, expression} = node;

        if (name && node.parent && expression) {
            const methodName: string = name.getText();
            const parent: ts.CallExpression = node.parent as ts.CallExpression;
            const fsArgsInfo: number[] | void = fsModuleMethodsArgumentsInfo.get(methodName);
            const methodArguments: ts.NodeArray<ts.Expression> = parent.arguments;

            if (fsArgsInfo && methodArguments && expressionsToCheck.includes(expression.getText())) {
                const invalidArgumentIndices: number[] = fsArgsInfo.filter((index: number) => {
                    const arg: ts.Expression = methodArguments[index];

                    if (!arg) {
                        return false;
                    }
                    const {kind} = arg;

                    if (kind === ts.SyntaxKind.BinaryExpression) {
                        const {left, right} = arg as ts.BinaryExpression;

                        if (
                            left &&
                            left.kind === ts.SyntaxKind.Identifier &&
                            reservedIdentifiers.includes(left.getText())
                        ) {
                            return Boolean(right && !stringLiteralKinds.includes(right.kind));
                        }

                        if (
                            right &&
                            right.kind === ts.SyntaxKind.Identifier &&
                            reservedIdentifiers.includes(right.getText())
                        ) {
                            return Boolean(left && !stringLiteralKinds.includes(left.kind));
                        }
                    }

                    if (kind === ts.SyntaxKind.TemplateExpression) {
                        const {templateSpans = []} = arg as ts.TemplateExpression;
                        const [firstTemplateSpan] = templateSpans;
                        const firstTemplateSpanExpr: ts.Expression | void =
                            firstTemplateSpan && firstTemplateSpan.expression;

                        if (
                            firstTemplateSpanExpr &&
                            firstTemplateSpanExpr.kind === ts.SyntaxKind.Identifier &&
                            reservedIdentifiers.includes(firstTemplateSpanExpr.getText()) &&
                            !templateSpans[1]
                        ) {
                            return false;
                        }
                    }

                    return !stringLiteralKinds.includes(kind);
                });

                if (invalidArgumentIndices[0] !== undefined) {
                    const errorIndex: string = invalidArgumentIndices.join(', ');

                    this.addFailureAtNode(
                        node,
                        `Found fs.${methodName} with non-literal argument at index ${errorIndex}`
                    );
                }
            }
        }

        super.visitPropertyAccessExpression(node);
    }
}
