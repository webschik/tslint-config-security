import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'tsr-detect-pseudo-random-bytes',
        description: 'Warns when crypto.pseudoRandomBytes() function is used',
        descriptionDetails: Lint.Utils.dedent`Any usage of crypto.pseudoRandomBytes() will trigger a warning.
            See https://github.com/webschik/tslint-config-security#tsr-detect-pseudo-random-bytes`,
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

            if (name && name.text === 'pseudoRandomBytes') {
                ctx.addFailureAtNode(
                    node,
                    'Found crypto.pseudoRandomBytes which does not produce cryptographically strong numbers'
                );
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
