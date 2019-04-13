import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    function visitNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const {expression, arguments: args} = node as ts.CallExpression;

            if (
                expression &&
                args &&
                expression.kind === ts.SyntaxKind.ElementAccessExpression &&
                args.find(ts.isIdentifier)
            ) {
                ctx.addFailureAtNode(node, 'Found unsafe properties access');
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
