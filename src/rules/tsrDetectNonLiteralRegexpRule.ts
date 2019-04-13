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
        if (node.kind === ts.SyntaxKind.NewExpression) {
            const {expression, arguments: args} = node as ts.NewExpression;
            const firstArgument: undefined | ts.Expression = args && args[0];

            if (
                expression &&
                firstArgument &&
                (expression as ts.Identifier).text === 'RegExp' &&
                !stringLiteralKinds.includes(firstArgument.kind)
            ) {
                ctx.addFailureAtNode(node, 'Found non-literal argument to RegExp Constructor');
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
