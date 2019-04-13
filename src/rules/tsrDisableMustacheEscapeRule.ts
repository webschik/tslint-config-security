import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'tsr-disable-mustache-escape',
        description: 'Warns when escapeMarkup=false property with some template engines is used',
        descriptionDetails: Lint.Utils.dedent`Any usage of escapeMarkup=false property will trigger a warning.
            See https://github.com/webschik/tslint-config-security#tsr-disable-mustache-escape`,
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
        if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const {name} = node as ts.PropertyAccessExpression;
            const parent: ts.BinaryExpression = node.parent as ts.BinaryExpression;

            if (
                name &&
                parent &&
                parent.operatorToken &&
                parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                parent.right &&
                parent.right.kind === ts.SyntaxKind.FalseKeyword &&
                name.text === 'escapeMarkup'
            ) {
                ctx.addFailureAtNode(node, 'Markup escaping disabled');
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
