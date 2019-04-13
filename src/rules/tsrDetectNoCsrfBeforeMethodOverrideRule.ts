import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'tsr-detect-no-csrf-before-method-override',
        description: 'Warns when csrf middleware for Express.js is setup before method-override middleware',
        descriptionDetails: Lint.Utils.dedent`Any usage of express.csrf() middleware before
            express.methodOverride() will trigger a warning.
            See https://github.com/webschik/tslint-config-security#tsr-detect-no-csrf-before-method-override`,
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
    let isCsrfFound: boolean | undefined;

    function visitNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const {name, expression} = node as ts.PropertyAccessExpression;
            const nameText: string | undefined = name && (name as ts.Identifier).text;

            if (expression && (expression as ts.Identifier).text === 'express') {
                if (isCsrfFound && nameText === 'methodOverride') {
                    ctx.addFailureAtNode(node, 'express.csrf() middleware found before express.methodOverride()');
                } else if (nameText === 'csrf') {
                    isCsrfFound = true;
                }
            }
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(ctx.sourceFile, visitNode);
}
