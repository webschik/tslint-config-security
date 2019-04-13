// @ts-ignore
import * as isSafeRegexp from 'safe-regex';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringLiteralKinds} from '../node-kind';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    function visitNode(node: ts.Node): void {
        switch (node.kind) {
            case ts.SyntaxKind.RegularExpressionLiteral: {
                const {text} = node as ts.RegularExpressionLiteral;

                if (text && !isSafeRegexp(text)) {
                    ctx.addFailureAtNode(node, 'Unsafe Regular Expression');
                }
                break;
            }
            case ts.SyntaxKind.NewExpression: {
                const {expression, arguments: args} = node as ts.NewExpression;
                const firstArgument = args && args[0];
                const firstArgumentText: string | undefined = firstArgument && (firstArgument as ts.StringLiteral).text;

                if (
                    expression &&
                    firstArgument &&
                    (expression as ts.Identifier).text === 'RegExp' &&
                    stringLiteralKinds.includes(firstArgument.kind) &&
                    firstArgumentText &&
                    !isSafeRegexp(firstArgumentText)
                ) {
                    ctx.addFailureAtNode(node, 'Unsafe Regular Expression (new RegExp)');
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
