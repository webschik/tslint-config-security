import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'tsr-detect-unsafe-properties-access',
        description: 'Warns when potential unsafe access to the object properties is found',
        descriptionDetails: Lint.Utils.dedent`Any potential unsafe access to the object properties
            will trigger a warning.
            See https://github.com/webschik/tslint-config-security#tsr-detect-unsafe-properties-access`,
        optionsDescription: '',
        options: null,
        type: 'functionality',
        requiresTypeInfo: false,
        typescriptOnly: false
    };

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
