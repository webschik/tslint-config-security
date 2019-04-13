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
            const {name} = expression as ts.PropertyAccessExpression;
            const [, targetOrigin]: ts.NodeArray<ts.Expression> = args || [];

            if (
                name &&
                targetOrigin &&
                name.text === 'postMessage' &&
                ((targetOrigin as ts.StringLiteral).text || '').trim() === '*'
            ) {
                ctx.addFailureAtNode(node, 'Found a wildcard keyword (*) in the targetOrigin argument');
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
